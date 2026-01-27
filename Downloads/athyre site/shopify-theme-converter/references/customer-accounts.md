# Customer Accounts Patterns

Complete patterns for customer authentication, account management, and order history in Shopify themes.

## Customer Object Reference

The `customer` object is available when a customer is logged in:

```liquid
{% if customer %}
  Welcome, {{ customer.first_name }}!
  Email: {{ customer.email }}
  Total orders: {{ customer.orders_count }}
{% else %}
  <a href="{{ routes.account_login_url }}">Sign in</a>
{% endif %}
```

### Customer Properties

| Property | Description |
|----------|-------------|
| `customer.id` | Unique customer ID |
| `customer.email` | Customer email address |
| `customer.first_name` | First name |
| `customer.last_name` | Last name |
| `customer.name` | Full name |
| `customer.orders` | Array of customer orders |
| `customer.orders_count` | Total number of orders |
| `customer.total_spent` | Total amount spent (in cents) |
| `customer.addresses` | Array of saved addresses |
| `customer.default_address` | Default shipping address |
| `customer.tags` | Customer tags (for segmentation) |
| `customer.accepts_marketing` | Marketing opt-in status |

---

## Login Form

### React Component
```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to authenticate
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Shopify Section
```liquid
{%- comment -%}
  sections/main-login.liquid
  Customer login form
{%- endcomment -%}

<section class="section-{{ section.id }} login-page">
  <div class="container container--narrow">
    <h1>{{ 'customer.login.title' | t }}</h1>

    {%- form 'customer_login' -%}
      {%- if form.errors -%}
        <div class="form__message form__message--error">
          {{ form.errors | default_errors }}
        </div>
      {%- endif -%}

      <div class="form__row">
        <label for="customer-email">{{ 'customer.login.email' | t }}</label>
        <input
          type="email"
          id="customer-email"
          name="customer[email]"
          autocomplete="email"
          autocapitalize="off"
          required
        >
      </div>

      <div class="form__row">
        <label for="customer-password">{{ 'customer.login.password' | t }}</label>
        <input
          type="password"
          id="customer-password"
          name="customer[password]"
          autocomplete="current-password"
          required
        >
      </div>

      <button type="submit" class="btn btn--primary btn--full">
        {{ 'customer.login.submit' | t }}
      </button>

      <p class="login-page__links">
        <a href="{{ routes.account_recover_url }}">{{ 'customer.login.forgot_password' | t }}</a>
        &bull;
        <a href="{{ routes.account_register_url }}">{{ 'customer.login.create_account' | t }}</a>
      </p>
    {%- endform -%}
  </div>
</section>
```

---

## Registration Form

### React Component
```jsx
function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  return (
    <form>
      <input name="firstName" placeholder="First Name" />
      <input name="lastName" placeholder="Last Name" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <label>
        <input type="checkbox" name="acceptsMarketing" />
        Subscribe to newsletter
      </label>
      <button type="submit">Create Account</button>
    </form>
  );
}
```

### Shopify Section
```liquid
{%- comment -%}
  sections/main-register.liquid
  Customer registration form
{%- endcomment -%}

<section class="section-{{ section.id }} register-page">
  <div class="container container--narrow">
    <h1>{{ 'customer.register.title' | t }}</h1>

    {%- form 'create_customer' -%}
      {%- if form.errors -%}
        <div class="form__message form__message--error">
          {{ form.errors | default_errors }}
        </div>
      {%- endif -%}

      <div class="form__row form__row--half">
        <div>
          <label for="first-name">{{ 'customer.register.first_name' | t }}</label>
          <input
            type="text"
            id="first-name"
            name="customer[first_name]"
            autocomplete="given-name"
            required
          >
        </div>
        <div>
          <label for="last-name">{{ 'customer.register.last_name' | t }}</label>
          <input
            type="text"
            id="last-name"
            name="customer[last_name]"
            autocomplete="family-name"
            required
          >
        </div>
      </div>

      <div class="form__row">
        <label for="email">{{ 'customer.register.email' | t }}</label>
        <input
          type="email"
          id="email"
          name="customer[email]"
          autocomplete="email"
          autocapitalize="off"
          required
        >
      </div>

      <div class="form__row">
        <label for="password">{{ 'customer.register.password' | t }}</label>
        <input
          type="password"
          id="password"
          name="customer[password]"
          autocomplete="new-password"
          required
        >
      </div>

      <div class="form__row">
        <label class="form__checkbox">
          <input type="checkbox" name="customer[accepts_marketing]" value="1">
          <span>{{ 'customer.register.accepts_marketing' | t }}</span>
        </label>
      </div>

      <button type="submit" class="btn btn--primary btn--full">
        {{ 'customer.register.submit' | t }}
      </button>

      <p class="register-page__links">
        {{ 'customer.register.have_account' | t }}
        <a href="{{ routes.account_login_url }}">{{ 'customer.login.title' | t }}</a>
      </p>
    {%- endform -%}
  </div>
</section>
```

---

## Account Dashboard

### React Component
```jsx
function AccountDashboard({ customer }) {
  return (
    <div className="account">
      <h1>My Account</h1>
      <p>Welcome, {customer.firstName}!</p>

      <section>
        <h2>Order History</h2>
        {customer.orders.map(order => (
          <OrderRow key={order.id} order={order} />
        ))}
      </section>

      <section>
        <h2>Addresses</h2>
        {customer.addresses.map(address => (
          <AddressCard key={address.id} address={address} />
        ))}
      </section>
    </div>
  );
}
```

### Shopify Section
```liquid
{%- comment -%}
  sections/main-account.liquid
  Customer account dashboard
{%- endcomment -%}

<section class="section-{{ section.id }} account-page">
  <div class="container">
    <header class="account-page__header">
      <h1>{{ 'customer.account.title' | t }}</h1>
      <a href="{{ routes.account_logout_url }}" class="btn btn--secondary">
        {{ 'customer.account.logout' | t }}
      </a>
    </header>

    <div class="account-page__grid">
      {%- comment -%} Account info {%- endcomment -%}
      <div class="account-page__info">
        <h2>{{ 'customer.account.details' | t }}</h2>
        <p>{{ customer.name }}</p>
        <p>{{ customer.email }}</p>

        {%- if customer.default_address -%}
          <h3>{{ 'customer.account.default_address' | t }}</h3>
          <address>
            {{ customer.default_address | format_address }}
          </address>
        {%- endif -%}

        <a href="{{ routes.account_addresses_url }}" class="btn btn--secondary">
          {{ 'customer.account.manage_addresses' | t }}
        </a>
      </div>

      {%- comment -%} Order history {%- endcomment -%}
      <div class="account-page__orders">
        <h2>{{ 'customer.orders.title' | t }}</h2>

        {%- if customer.orders.size > 0 -%}
          <table class="orders-table">
            <thead>
              <tr>
                <th>{{ 'customer.orders.order_number' | t }}</th>
                <th>{{ 'customer.orders.date' | t }}</th>
                <th>{{ 'customer.orders.payment_status' | t }}</th>
                <th>{{ 'customer.orders.fulfillment_status' | t }}</th>
                <th>{{ 'customer.orders.total' | t }}</th>
              </tr>
            </thead>
            <tbody>
              {%- for order in customer.orders -%}
                <tr>
                  <td>
                    <a href="{{ order.customer_url }}">{{ order.name }}</a>
                  </td>
                  <td>{{ order.created_at | date: format: 'date' }}</td>
                  <td>{{ order.financial_status_label }}</td>
                  <td>{{ order.fulfillment_status_label }}</td>
                  <td>{{ order.total_price | money }}</td>
                </tr>
              {%- endfor -%}
            </tbody>
          </table>
        {%- else -%}
          <p>{{ 'customer.orders.none' | t }}</p>
        {%- endif -%}
      </div>
    </div>
  </div>
</section>
```

---

## Password Recovery

### Form Pattern
```liquid
{%- comment -%}
  Password recovery form (on login page or separate page)
{%- endcomment -%}

{%- form 'recover_customer_password' -%}
  {%- if form.posted_successfully? -%}
    <div class="form__message form__message--success">
      {{ 'customer.recover_password.success' | t }}
    </div>
  {%- endif -%}

  {%- if form.errors -%}
    <div class="form__message form__message--error">
      {{ form.errors | default_errors }}
    </div>
  {%- endif -%}

  <div class="form__row">
    <label for="recover-email">{{ 'customer.recover_password.email' | t }}</label>
    <input
      type="email"
      id="recover-email"
      name="email"
      autocomplete="email"
      autocapitalize="off"
      required
    >
  </div>

  <button type="submit" class="btn btn--primary">
    {{ 'customer.recover_password.submit' | t }}
  </button>
{%- endform -%}
```

---

## Password Reset (After Email Link)

```liquid
{%- comment -%}
  templates/customers/reset_password.json references this section
  Customer enters new password after clicking email link
{%- endcomment -%}

{%- form 'reset_customer_password' -%}
  {%- if form.errors -%}
    <div class="form__message form__message--error">
      {{ form.errors | default_errors }}
    </div>
  {%- endif -%}

  <div class="form__row">
    <label for="new-password">{{ 'customer.reset_password.password' | t }}</label>
    <input
      type="password"
      id="new-password"
      name="customer[password]"
      autocomplete="new-password"
      required
    >
  </div>

  <div class="form__row">
    <label for="confirm-password">{{ 'customer.reset_password.password_confirm' | t }}</label>
    <input
      type="password"
      id="confirm-password"
      name="customer[password_confirmation]"
      autocomplete="new-password"
      required
    >
  </div>

  <button type="submit" class="btn btn--primary">
    {{ 'customer.reset_password.submit' | t }}
  </button>
{%- endform -%}
```

---

## Account Activation

```liquid
{%- comment -%}
  templates/customers/activate_account.json
  Customer sets password after receiving activation email
{%- endcomment -%}

{%- form 'activate_customer_password' -%}
  {%- if form.errors -%}
    <div class="form__message form__message--error">
      {{ form.errors | default_errors }}
    </div>
  {%- endif -%}

  <h1>{{ 'customer.activate_account.title' | t }}</h1>
  <p>{{ 'customer.activate_account.subtext' | t }}</p>

  <div class="form__row">
    <label for="activate-password">{{ 'customer.activate_account.password' | t }}</label>
    <input
      type="password"
      id="activate-password"
      name="customer[password]"
      autocomplete="new-password"
      required
    >
  </div>

  <div class="form__row">
    <label for="activate-password-confirm">{{ 'customer.activate_account.password_confirm' | t }}</label>
    <input
      type="password"
      id="activate-password-confirm"
      name="customer[password_confirmation]"
      autocomplete="new-password"
      required
    >
  </div>

  <button type="submit" class="btn btn--primary">
    {{ 'customer.activate_account.submit' | t }}
  </button>
  <a href="{{ routes.account_login_url }}">{{ 'customer.activate_account.cancel' | t }}</a>
{%- endform -%}
```

---

## Address Management

### Address Form
```liquid
{%- comment -%}
  Address form - used for both new and edit
  Pass `address` variable for edit mode
{%- endcomment -%}

{%- form 'customer_address', customer.new_address -%}
  <div class="form__row form__row--half">
    <div>
      <label for="address-first-name">{{ 'customer.addresses.first_name' | t }}</label>
      <input
        type="text"
        id="address-first-name"
        name="address[first_name]"
        value="{{ form.first_name }}"
        autocomplete="given-name"
      >
    </div>
    <div>
      <label for="address-last-name">{{ 'customer.addresses.last_name' | t }}</label>
      <input
        type="text"
        id="address-last-name"
        name="address[last_name]"
        value="{{ form.last_name }}"
        autocomplete="family-name"
      >
    </div>
  </div>

  <div class="form__row">
    <label for="address-company">{{ 'customer.addresses.company' | t }}</label>
    <input
      type="text"
      id="address-company"
      name="address[company]"
      value="{{ form.company }}"
      autocomplete="organization"
    >
  </div>

  <div class="form__row">
    <label for="address-address1">{{ 'customer.addresses.address1' | t }}</label>
    <input
      type="text"
      id="address-address1"
      name="address[address1]"
      value="{{ form.address1 }}"
      autocomplete="address-line1"
      required
    >
  </div>

  <div class="form__row">
    <label for="address-address2">{{ 'customer.addresses.address2' | t }}</label>
    <input
      type="text"
      id="address-address2"
      name="address[address2]"
      value="{{ form.address2 }}"
      autocomplete="address-line2"
    >
  </div>

  <div class="form__row form__row--half">
    <div>
      <label for="address-city">{{ 'customer.addresses.city' | t }}</label>
      <input
        type="text"
        id="address-city"
        name="address[city]"
        value="{{ form.city }}"
        autocomplete="address-level2"
        required
      >
    </div>
    <div>
      <label for="address-country">{{ 'customer.addresses.country' | t }}</label>
      <select
        id="address-country"
        name="address[country]"
        data-address-country-select
        autocomplete="country"
      >
        {{ all_country_option_tags }}
      </select>
    </div>
  </div>

  <div class="form__row form__row--half">
    <div>
      <label for="address-province">{{ 'customer.addresses.province' | t }}</label>
      <select
        id="address-province"
        name="address[province]"
        data-address-province-select
        autocomplete="address-level1"
      >
        <!-- Populated by JavaScript -->
      </select>
    </div>
    <div>
      <label for="address-zip">{{ 'customer.addresses.zip' | t }}</label>
      <input
        type="text"
        id="address-zip"
        name="address[zip]"
        value="{{ form.zip }}"
        autocomplete="postal-code"
        required
      >
    </div>
  </div>

  <div class="form__row">
    <label for="address-phone">{{ 'customer.addresses.phone' | t }}</label>
    <input
      type="tel"
      id="address-phone"
      name="address[phone]"
      value="{{ form.phone }}"
      autocomplete="tel"
    >
  </div>

  <div class="form__row">
    <label class="form__checkbox">
      <input
        type="checkbox"
        name="address[default]"
        value="1"
        {% if form.default? %}checked{% endif %}
      >
      <span>{{ 'customer.addresses.set_default' | t }}</span>
    </label>
  </div>

  <button type="submit" class="btn btn--primary">
    {{ 'customer.addresses.add' | t }}
  </button>
{%- endform -%}
```

### Address List
```liquid
{%- comment -%}
  sections/main-addresses.liquid
  Customer address list and management
{%- endcomment -%}

<section class="section-{{ section.id }} addresses-page">
  <div class="container">
    <h1>{{ 'customer.addresses.title' | t }}</h1>

    <button type="button" class="btn btn--primary" data-toggle-new-address>
      {{ 'customer.addresses.add_new' | t }}
    </button>

    {%- comment -%} New address form (hidden by default) {%- endcomment -%}
    <div class="addresses-page__new-form" id="new-address-form" hidden>
      <h2>{{ 'customer.addresses.add_new' | t }}</h2>
      {%- form 'customer_address', customer.new_address -%}
        {%- comment -%} Include address form fields {%- endcomment -%}
      {%- endform -%}
    </div>

    {%- comment -%} Existing addresses {%- endcomment -%}
    {%- if customer.addresses.size > 0 -%}
      <ul class="addresses-page__list">
        {%- for address in customer.addresses -%}
          <li class="addresses-page__item">
            {%- if address == customer.default_address -%}
              <span class="addresses-page__default-badge">{{ 'customer.addresses.default' | t }}</span>
            {%- endif -%}

            <address>
              {{ address | format_address }}
            </address>

            <div class="addresses-page__actions">
              <button type="button" class="btn btn--secondary" data-edit-address="{{ address.id }}">
                {{ 'customer.addresses.edit' | t }}
              </button>

              {%- form 'customer_address', address -%}
                <input type="hidden" name="_method" value="delete">
                <button type="submit" class="btn btn--outline">
                  {{ 'customer.addresses.delete' | t }}
                </button>
              {%- endform -%}
            </div>

            {%- comment -%} Edit form (hidden by default) {%- endcomment -%}
            <div class="addresses-page__edit-form" id="edit-address-{{ address.id }}" hidden>
              {%- form 'customer_address', address -%}
                {%- comment -%} Include address form fields with address values {%- endcomment -%}
              {%- endform -%}
            </div>
          </li>
        {%- endfor -%}
      </ul>
    {%- else -%}
      <p>{{ 'customer.addresses.no_addresses' | t }}</p>
    {%- endif -%}
  </div>
</section>
```

---

## Order Details

```liquid
{%- comment -%}
  sections/main-order.liquid
  Individual order details page
{%- endcomment -%}

<section class="section-{{ section.id }} order-page">
  <div class="container">
    <a href="{{ routes.account_url }}" class="order-page__back">
      {%- render 'icon', icon: 'chevron-left', size: 16 -%}
      {{ 'customer.account.return' | t }}
    </a>

    <h1>{{ 'customer.order.title' | t: name: order.name }}</h1>

    <p class="order-page__date">
      {{ 'customer.order.date' | t: date: order.created_at | date: format: 'date' }}
    </p>

    {%- if order.cancelled -%}
      <div class="order-page__cancelled">
        {{ 'customer.order.cancelled_on' | t: date: order.cancelled_at | date: format: 'date' }}
        <p>{{ 'customer.order.cancelled_reason' | t: reason: order.cancel_reason_label }}</p>
      </div>
    {%- endif -%}

    {%- comment -%} Order items {%- endcomment -%}
    <table class="order-page__items">
      <thead>
        <tr>
          <th colspan="2">{{ 'customer.order.product' | t }}</th>
          <th>{{ 'customer.order.sku' | t }}</th>
          <th>{{ 'customer.order.price' | t }}</th>
          <th>{{ 'customer.order.quantity' | t }}</th>
          <th>{{ 'customer.order.total' | t }}</th>
        </tr>
      </thead>
      <tbody>
        {%- for line_item in order.line_items -%}
          <tr>
            <td class="order-page__item-image">
              {%- if line_item.product.featured_image -%}
                {{ line_item.product.featured_image | image_url: width: 100 | image_tag }}
              {%- endif -%}
            </td>
            <td>
              <a href="{{ line_item.product.url }}">{{ line_item.title }}</a>
              {%- if line_item.fulfillment -%}
                <p class="order-page__fulfillment">
                  {{ 'customer.order.fulfilled_on' | t: date: line_item.fulfillment.created_at | date: format: 'date' }}
                  {%- if line_item.fulfillment.tracking_number -%}
                    <a href="{{ line_item.fulfillment.tracking_url }}">
                      {{ line_item.fulfillment.tracking_number }}
                    </a>
                  {%- endif -%}
                </p>
              {%- endif -%}
            </td>
            <td>{{ line_item.sku }}</td>
            <td>{{ line_item.final_price | money }}</td>
            <td>{{ line_item.quantity }}</td>
            <td>{{ line_item.final_line_price | money }}</td>
          </tr>
        {%- endfor -%}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5">{{ 'customer.order.subtotal' | t }}</td>
          <td>{{ order.line_items_subtotal_price | money }}</td>
        </tr>
        {%- for discount in order.discounts -%}
          <tr>
            <td colspan="5">{{ discount.code }}</td>
            <td>-{{ discount.savings | money }}</td>
          </tr>
        {%- endfor -%}
        {%- for shipping_method in order.shipping_methods -%}
          <tr>
            <td colspan="5">{{ 'customer.order.shipping' | t }} ({{ shipping_method.title }})</td>
            <td>{{ shipping_method.price | money }}</td>
          </tr>
        {%- endfor -%}
        {%- for tax_line in order.tax_lines -%}
          <tr>
            <td colspan="5">{{ 'customer.order.tax' | t }} ({{ tax_line.title }} {{ tax_line.rate_percentage }}%)</td>
            <td>{{ tax_line.price | money }}</td>
          </tr>
        {%- endfor -%}
        <tr class="order-page__total">
          <td colspan="5">{{ 'customer.order.total' | t }}</td>
          <td>{{ order.total_price | money }}</td>
        </tr>
      </tfoot>
    </table>

    {%- comment -%} Addresses {%- endcomment -%}
    <div class="order-page__addresses">
      <div>
        <h2>{{ 'customer.order.billing_address' | t }}</h2>
        <p>{{ 'customer.order.payment_status' | t }}: {{ order.financial_status_label }}</p>
        <address>{{ order.billing_address | format_address }}</address>
      </div>
      <div>
        <h2>{{ 'customer.order.shipping_address' | t }}</h2>
        <p>{{ 'customer.order.fulfillment_status' | t }}: {{ order.fulfillment_status_label }}</p>
        <address>{{ order.shipping_address | format_address }}</address>
      </div>
    </div>
  </div>
</section>
```

---

## Routes Reference

| Route | Variable | Description |
|-------|----------|-------------|
| `/account` | `routes.account_url` | Account dashboard |
| `/account/login` | `routes.account_login_url` | Login page |
| `/account/register` | `routes.account_register_url` | Registration page |
| `/account/logout` | `routes.account_logout_url` | Logout action |
| `/account/recover` | `routes.account_recover_url` | Password recovery |
| `/account/addresses` | `routes.account_addresses_url` | Address management |

---

## Translation Keys

Add these to `locales/en.default.json`:

```json
{
  "customer": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign in",
      "forgot_password": "Forgot your password?",
      "create_account": "Create account"
    },
    "register": {
      "title": "Create Account",
      "first_name": "First name",
      "last_name": "Last name",
      "email": "Email",
      "password": "Password",
      "submit": "Create",
      "accepts_marketing": "Subscribe to our newsletter",
      "have_account": "Already have an account?"
    },
    "recover_password": {
      "title": "Reset your password",
      "email": "Email",
      "submit": "Submit",
      "success": "We've sent you an email with a link to reset your password."
    },
    "reset_password": {
      "title": "Reset account password",
      "password": "New password",
      "password_confirm": "Confirm new password",
      "submit": "Reset password"
    },
    "activate_account": {
      "title": "Activate Account",
      "subtext": "Create your password to activate your account.",
      "password": "Password",
      "password_confirm": "Confirm password",
      "submit": "Activate account",
      "cancel": "Decline invitation"
    },
    "account": {
      "title": "My Account",
      "logout": "Log out",
      "details": "Account Details",
      "default_address": "Default Address",
      "manage_addresses": "View addresses",
      "return": "Return to Account"
    },
    "orders": {
      "title": "Order History",
      "order_number": "Order",
      "date": "Date",
      "payment_status": "Payment",
      "fulfillment_status": "Fulfillment",
      "total": "Total",
      "none": "You haven't placed any orders yet."
    },
    "addresses": {
      "title": "Your Addresses",
      "add_new": "Add new address",
      "default": "Default",
      "edit": "Edit",
      "delete": "Delete",
      "first_name": "First name",
      "last_name": "Last name",
      "company": "Company",
      "address1": "Address",
      "address2": "Apartment, suite, etc.",
      "city": "City",
      "country": "Country/Region",
      "province": "State/Province",
      "zip": "Postal/ZIP code",
      "phone": "Phone",
      "set_default": "Set as default address",
      "add": "Add address",
      "update": "Update address",
      "no_addresses": "You haven't saved any addresses yet."
    }
  }
}
```

---

## Conversion Reference: React to Shopify

| React Pattern | Shopify Equivalent |
|--------------|-------------------|
| `useState` for form | Form values from `form` object |
| `onSubmit` handler | `{% form 'form_name' %}` action |
| Error state | `form.errors` |
| Success state | `form.posted_successfully?` |
| `useAuth()` context | `customer` global object |
| `isAuthenticated` | `{% if customer %}` |
| `logout()` | Link to `routes.account_logout_url` |
| Router redirects | Shopify handles redirects automatically |
| API auth calls | Shopify handles authentication |
