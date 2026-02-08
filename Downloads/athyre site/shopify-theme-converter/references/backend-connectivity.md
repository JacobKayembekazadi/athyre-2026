# Backend Connectivity Reference

## Overview

Shopify themes can connect to external systems via:
- **App Proxy** - Secure backend endpoints through store domain
- **Webhooks** - Event-driven notifications
- **Storefront API** - GraphQL queries from frontend
- **Metafields** - Store data fetched at page load

---

## Part 1: App Proxy

### What Is App Proxy?

App Proxy allows requests to your backend through the Shopify storefront domain:

```
https://store.myshopify.com/apps/my-proxy/endpoint
                ↓
https://your-backend.com/api/endpoint
```

**Benefits:**
- No CORS issues
- Customer session available
- Can return Liquid (rendered by Shopify)
- Secure (HMAC verification)

### Configuration

In your Shopify app settings:
- **Subpath prefix:** `apps`
- **Subpath:** `my-proxy`
- **Proxy URL:** `https://your-backend.com/api`

### Request Flow

```
1. Browser → https://store.com/apps/my-proxy/endpoint
2. Shopify adds headers → forwards to your backend
3. Backend processes → returns response
4. If Content-Type: application/liquid → Shopify renders Liquid
5. Response → Browser
```

### Shopify Headers Sent to Your Backend

| Header | Description |
|--------|-------------|
| `X-Shopify-Shop-Domain` | Store domain |
| `X-Shopify-Logged-In-Customer-Id` | Customer ID (if logged in) |
| `X-Shopify-Hmac-Sha256` | HMAC for verification |

### Verifying Requests

```javascript
// Node.js example
const crypto = require('crypto');

function verifyAppProxy(query) {
  const { signature, ...params } = query;

  // Sort and stringify params
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('');

  // Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(sortedParams)
    .digest('hex');

  return hmac === signature;
}

// Express middleware
app.use('/api', (req, res, next) => {
  if (!verifyAppProxy(req.query)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### Returning Liquid

```javascript
// Return Liquid that Shopify will render
app.get('/api/wishlist', (req, res) => {
  const items = getWishlistItems(req.query.logged_in_customer_id);

  res.setHeader('Content-Type', 'application/liquid');
  res.send(`
    <div class="wishlist">
      {% for item in items %}
        <div class="wishlist-item">
          <h3>{{ item.title }}</h3>
          <a href="{{ item.url }}">View Product</a>
        </div>
      {% endfor %}
    </div>
  `);
});
```

### Theme Integration

```liquid
{% comment %} Fetch from app proxy {% endcomment %}
<div id="wishlist-container" data-wishlist-url="/apps/my-proxy/wishlist">
  <p>Loading wishlist...</p>
</div>

<script>
  async function loadWishlist() {
    const container = document.getElementById('wishlist-container');
    const url = container.dataset.wishlistUrl;

    try {
      const response = await fetch(url);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = '<p>Unable to load wishlist</p>';
    }
  }

  loadWishlist();
</script>
```

---

## Part 2: Webhooks

### What Are Webhooks?

Webhooks notify your backend when events happen in Shopify:
- Order created
- Customer registered
- Product updated
- Inventory changed

### Common Webhook Topics

| Topic | When Fired |
|-------|------------|
| `orders/create` | New order placed |
| `orders/paid` | Order payment received |
| `orders/fulfilled` | Order shipped |
| `orders/cancelled` | Order cancelled |
| `customers/create` | New customer registered |
| `customers/update` | Customer info changed |
| `products/create` | New product created |
| `products/update` | Product modified |
| `inventory_levels/update` | Stock changed |
| `refunds/create` | Refund processed |
| `carts/create` | Cart started |
| `carts/update` | Cart modified |
| `app/uninstalled` | App removed |

### Webhook Payload Example

```json
{
  "id": 123456789,
  "email": "customer@example.com",
  "created_at": "2026-02-08T12:00:00-05:00",
  "updated_at": "2026-02-08T12:00:00-05:00",
  "total_price": "150.00",
  "currency": "USD",
  "financial_status": "paid",
  "fulfillment_status": null,
  "line_items": [
    {
      "id": 987654321,
      "title": "Product Name",
      "quantity": 2,
      "price": "75.00"
    }
  ],
  "customer": {
    "id": 111222333,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "shipping_address": {
    "address1": "123 Main St",
    "city": "New York",
    "province": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

### Webhook Headers

| Header | Description |
|--------|-------------|
| `X-Shopify-Topic` | Event type (e.g., `orders/create`) |
| `X-Shopify-Hmac-Sha256` | HMAC signature |
| `X-Shopify-Shop-Domain` | Store domain |
| `X-Shopify-Webhook-Id` | Webhook subscription ID |
| `X-Shopify-Event-Id` | Unique event ID (for deduplication) |
| `X-Shopify-Triggered-At` | Timestamp |

### Verifying Webhooks

```javascript
const crypto = require('crypto');

function verifyWebhook(body, hmacHeader) {
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(hmacHeader)
  );
}

// Express middleware
app.post('/webhooks/:topic', express.raw({ type: 'application/json' }), (req, res) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');

  if (!verifyWebhook(req.body, hmac)) {
    return res.status(401).send('Unauthorized');
  }

  // Process webhook
  const data = JSON.parse(req.body);
  handleWebhook(req.params.topic, data);

  res.status(200).send('OK');
});
```

### Handling Duplicate Events

```javascript
const processedEvents = new Set();

async function handleWebhook(eventId, topic, data) {
  // Check for duplicate
  if (processedEvents.has(eventId)) {
    console.log(`Duplicate event ${eventId}, skipping`);
    return;
  }

  processedEvents.add(eventId);

  // Process based on topic
  switch (topic) {
    case 'orders/create':
      await handleNewOrder(data);
      break;
    case 'customers/create':
      await handleNewCustomer(data);
      break;
    // ... other topics
  }
}
```

### Creating Webhooks via API

```javascript
// Using @shopify/shopify-api
const webhook = await shopify.rest.Webhook.create({
  session,
  topic: 'orders/create',
  address: 'https://your-backend.com/webhooks/orders-create',
  format: 'json'
});
```

### Creating Webhooks via Admin

1. Settings → Notifications
2. Scroll to Webhooks
3. Create webhook
4. Select event and enter URL

---

## Part 3: Storefront API

### When to Use

- Headless commerce
- Dynamic cart updates
- Customer operations from JavaScript
- Real-time inventory checks

### Getting Access Token

```liquid
{% comment %} In theme.liquid {% endcomment %}
<script>
  window.shopifyStorefrontToken = '{{ settings.storefront_api_token }}';
</script>
```

### Basic Query

```javascript
async function fetchProducts(query) {
  const response = await fetch('/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': window.shopifyStorefrontToken
    },
    body: JSON.stringify({
      query: `
        query searchProducts($query: String!) {
          products(first: 10, query: $query) {
            edges {
              node {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                }
              }
            }
          }
        }
      `,
      variables: { query }
    })
  });

  const { data } = await response.json();
  return data.products.edges.map(edge => edge.node);
}
```

### Cart Operations

```javascript
// Create cart
async function createCart(lines) {
  const response = await fetch('/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': window.shopifyStorefrontToken
    },
    body: JSON.stringify({
      query: `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              lines(first: 10) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        product {
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          lines: lines.map(line => ({
            merchandiseId: line.variantId,
            quantity: line.quantity
          }))
        }
      }
    })
  });

  const { data } = await response.json();
  return data.cartCreate.cart;
}
```

---

## Part 4: Integration Patterns

### Pattern 1: CRM Sync

```javascript
// Webhook handler for CRM sync
async function handleNewOrder(orderData) {
  const crmContact = await crm.findOrCreate({
    email: orderData.customer.email,
    firstName: orderData.customer.first_name,
    lastName: orderData.customer.last_name
  });

  await crm.createDeal({
    contactId: crmContact.id,
    amount: orderData.total_price,
    source: 'Shopify',
    orderId: orderData.id
  });
}
```

### Pattern 2: Inventory Sync

```javascript
// Webhook handler for inventory sync
async function handleInventoryUpdate(data) {
  const { inventory_item_id, available } = data;

  // Sync to external system
  await inventorySystem.update({
    shopifyItemId: inventory_item_id,
    quantity: available
  });

  // Alert if low stock
  if (available < 10) {
    await slack.send(`Low stock alert: Item ${inventory_item_id} has ${available} units`);
  }
}
```

### Pattern 3: Custom Calculations via App Proxy

```liquid
{% comment %} Request shipping estimate from backend {% endcomment %}
<div id="shipping-estimate" data-zipcode-form>
  <input type="text" id="zipcode" placeholder="Enter ZIP code">
  <button type="button" data-get-estimate>Get Estimate</button>
  <div id="estimate-result"></div>
</div>

<script>
  document.querySelector('[data-get-estimate]').addEventListener('click', async () => {
    const zipcode = document.getElementById('zipcode').value;
    const response = await fetch(`/apps/shipping/estimate?zipcode=${zipcode}&cart_total={{ cart.total_price }}`);
    const data = await response.json();

    document.getElementById('estimate-result').innerHTML = `
      <p>Estimated shipping: ${data.estimate}</p>
      <p>Delivery: ${data.delivery_days} business days</p>
    `;
  });
</script>
```

---

## Part 5: Conversion Checklist

### When Source Site Has Backend Integrations

| Source Integration | Shopify Solution | Complexity |
|-------------------|------------------|------------|
| Custom API endpoints | App Proxy | Medium-High |
| CRM sync | Webhooks | Medium |
| Inventory sync | Webhooks | Medium |
| Email marketing | Webhooks or Klaviyo app | Low-Medium |
| Custom calculations | App Proxy + backend | High |
| Real-time data | Storefront API | Medium |

### Documentation for Client

```markdown
## Backend Integration Requirements

### Webhooks Needed

| Event | Purpose | Endpoint |
|-------|---------|----------|
| orders/create | Sync to CRM | https://api.example.com/webhooks/shopify/order |
| orders/fulfilled | Trigger shipping notification | https://api.example.com/webhooks/shopify/fulfilled |
| customers/create | Add to email list | https://api.example.com/webhooks/shopify/customer |
| inventory_levels/update | Sync to warehouse system | https://api.example.com/webhooks/shopify/inventory |

### App Proxy Routes Needed

| Route | Purpose |
|-------|---------|
| /apps/custom/wishlist | Fetch customer wishlist |
| /apps/custom/shipping-estimate | Calculate shipping rates |
| /apps/custom/personalization | Product customization preview |

### External Services to Connect

| Service | Integration Method | Required Credentials |
|---------|-------------------|---------------------|
| Salesforce | Webhooks | API Key |
| Mailchimp | Klaviyo app (recommended) or Webhooks | API Key |
| Custom Warehouse | Webhooks | API Key + Secret |

### Setup After Theme Upload

1. Create webhook subscriptions in Settings → Notifications
2. Install app for app proxy routes
3. Configure external service API keys
4. Test each integration
```

---

## Part 6: Security Best Practices

### Always Verify Requests

```javascript
// NEVER trust unverified requests
app.post('/webhooks/*', (req, res, next) => {
  if (!verifyWebhookHmac(req)) {
    return res.status(401).send('Invalid signature');
  }
  next();
});

app.all('/apps/*', (req, res, next) => {
  if (!verifyAppProxySignature(req)) {
    return res.status(401).send('Invalid signature');
  }
  next();
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // 100 requests per second
  message: 'Too many requests'
});

app.use('/webhooks', webhookLimiter);
```

### Idempotency

```javascript
// Store processed event IDs
const redis = require('redis');
const client = redis.createClient();

async function isProcessed(eventId) {
  const exists = await client.exists(`event:${eventId}`);
  return exists === 1;
}

async function markProcessed(eventId) {
  // Expire after 48 hours (Shopify's retry window)
  await client.setex(`event:${eventId}`, 172800, 'processed');
}
```

### Async Processing

```javascript
// Respond immediately, process asynchronously
app.post('/webhooks/:topic', async (req, res) => {
  // Verify signature
  if (!verifyWebhook(req)) {
    return res.status(401).send('Unauthorized');
  }

  // Acknowledge receipt immediately
  res.status(200).send('OK');

  // Process asynchronously
  const eventId = req.get('X-Shopify-Event-Id');
  queue.add('process-webhook', {
    topic: req.params.topic,
    data: req.body,
    eventId
  });
});
```
