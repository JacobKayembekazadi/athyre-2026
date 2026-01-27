# Conversion Examples

Side-by-side examples showing how to convert common web components to Shopify sections.

## Hero Banner

### React Input
```jsx
function Hero({ heading, subheading, buttonText, buttonLink, backgroundImage }) {
  return (
    <section className="hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="hero-content">
        <h1>{heading}</h1>
        <p>{subheading}</p>
        <a href={buttonLink} className="btn">{buttonText}</a>
      </div>
    </section>
  );
}
```

### Shopify Section Output
```liquid
<section class="hero section-{{ section.id }}" {{ block.shopify_attributes }}>
  {% if section.settings.image != blank %}
    <div class="hero-background">
      {{ section.settings.image | image_url: width: 1920 | image_tag: loading: 'lazy' }}
    </div>
  {% endif %}
  
  <div class="hero-content">
    {% if section.settings.heading != blank %}
      <h1>{{ section.settings.heading }}</h1>
    {% endif %}
    
    {% if section.settings.subheading != blank %}
      <p>{{ section.settings.subheading }}</p>
    {% endif %}
    
    {% if section.settings.button_text != blank %}
      <a href="{{ section.settings.button_link }}" class="btn btn--{{ section.settings.button_style }}">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

{% style %}
  .section-{{ section.id }} {
    position: relative;
    min-height: {{ section.settings.min_height }}vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: {{ section.settings.text_alignment }};
    color: {{ section.settings.text_color }};
    padding: {{ section.settings.padding_top }}px 1rem {{ section.settings.padding_bottom }}px;
  }
  
  .section-{{ section.id }} .hero-background {
    position: absolute;
    inset: 0;
    z-index: -1;
  }
  
  .section-{{ section.id }} .hero-background img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .section-{{ section.id }}::before {
    content: '';
    position: absolute;
    inset: 0;
    background: {{ section.settings.overlay_color }};
    opacity: {{ section.settings.overlay_opacity | divided_by: 100.0 }};
    z-index: -1;
  }
{% endstyle %}

{% schema %}
{
  "name": "Hero banner",
  "tag": "section",
  "class": "hero-section",
  "settings": [
    {
      "type": "header",
      "content": "Content"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome to our store"
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading",
      "default": "Discover amazing products"
    },
    {
      "type": "header",
      "content": "Button"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button text",
      "default": "Shop now"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button link"
    },
    {
      "type": "select",
      "id": "button_style",
      "label": "Button style",
      "default": "primary",
      "options": [
        { "value": "primary", "label": "Primary" },
        { "value": "secondary", "label": "Secondary" },
        { "value": "outline", "label": "Outline" }
      ]
    },
    {
      "type": "header",
      "content": "Background"
    },
    {
      "type": "image_picker",
      "id": "image",
      "label": "Background image"
    },
    {
      "type": "color",
      "id": "overlay_color",
      "label": "Overlay color",
      "default": "#000000"
    },
    {
      "type": "range",
      "id": "overlay_opacity",
      "label": "Overlay opacity",
      "min": 0,
      "max": 100,
      "step": 5,
      "unit": "%",
      "default": 30
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "min_height",
      "label": "Minimum height",
      "min": 30,
      "max": 100,
      "step": 5,
      "unit": "vh",
      "default": 70
    },
    {
      "type": "select",
      "id": "text_alignment",
      "label": "Text alignment",
      "default": "center",
      "options": [
        { "value": "left", "label": "Left" },
        { "value": "center", "label": "Center" },
        { "value": "right", "label": "Right" }
      ]
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text color",
      "default": "#ffffff"
    },
    {
      "type": "header",
      "content": "Spacing"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Top padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 40
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 40
    }
  ],
  "presets": [
    {
      "name": "Hero banner"
    }
  ]
}
{% endschema %}
```

---

## Testimonials (Using Blocks)

### React Input
```jsx
function Testimonials({ heading, testimonials }) {
  return (
    <section className="testimonials">
      <h2>{heading}</h2>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <blockquote>{t.quote}</blockquote>
            <div className="author">
              <img src={t.avatar} alt={t.name} />
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Shopify Section Output (with Blocks)
```liquid
<section class="testimonials section-{{ section.id }}">
  <div class="container">
    {% if section.settings.heading != blank %}
      <h2 class="testimonials-heading">{{ section.settings.heading }}</h2>
    {% endif %}
    
    {% if section.blocks.size > 0 %}
      <div class="testimonials-grid" style="--columns: {{ section.settings.columns }}">
        {% for block in section.blocks %}
          <div class="testimonial-card" {{ block.shopify_attributes }}>
            {% if block.settings.quote != blank %}
              <blockquote>{{ block.settings.quote }}</blockquote>
            {% endif %}
            
            <div class="author">
              {% if block.settings.avatar != blank %}
                {{ block.settings.avatar | image_url: width: 80 | image_tag: class: 'author-avatar' }}
              {% endif %}
              <div class="author-info">
                {% if block.settings.name != blank %}
                  <strong>{{ block.settings.name }}</strong>
                {% endif %}
                {% if block.settings.role != blank %}
                  <span>{{ block.settings.role }}</span>
                {% endif %}
              </div>
            </div>
          </div>
        {% endfor %}
      </div>
    {% endif %}
  </div>
</section>

{% style %}
  .section-{{ section.id }} {
    padding: {{ section.settings.padding_top }}px 1rem {{ section.settings.padding_bottom }}px;
    background: {{ section.settings.background_color }};
  }
  
  .section-{{ section.id }} .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 2rem;
  }
  
  @media (max-width: 768px) {
    .section-{{ section.id }} .testimonials-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .section-{{ section.id }} .testimonial-card {
    background: {{ section.settings.card_background }};
    padding: 2rem;
    border-radius: 8px;
  }
  
  .section-{{ section.id }} blockquote {
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }
  
  .section-{{ section.id }} .author {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .section-{{ section.id }} .author-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
{% endstyle %}

{% schema %}
{
  "name": "Testimonials",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "What our customers say"
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "range",
      "id": "columns",
      "label": "Columns",
      "min": 1,
      "max": 4,
      "step": 1,
      "default": 3
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Background color",
      "default": "#f8f8f8"
    },
    {
      "type": "color",
      "id": "card_background",
      "label": "Card background",
      "default": "#ffffff"
    },
    {
      "type": "header",
      "content": "Spacing"
    },
    {
      "type": "range",
      "id": "padding_top",
      "label": "Top padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 60
    },
    {
      "type": "range",
      "id": "padding_bottom",
      "label": "Bottom padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 60
    }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        {
          "type": "textarea",
          "id": "quote",
          "label": "Quote",
          "default": "This product changed my life!"
        },
        {
          "type": "image_picker",
          "id": "avatar",
          "label": "Author photo"
        },
        {
          "type": "text",
          "id": "name",
          "label": "Author name",
          "default": "Jane Doe"
        },
        {
          "type": "text",
          "id": "role",
          "label": "Author role",
          "default": "Customer"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Testimonials",
      "blocks": [
        { "type": "testimonial" },
        { "type": "testimonial" },
        { "type": "testimonial" }
      ]
    }
  ]
}
{% endschema %}
```

---

## Feature Grid (Mixed Block Types)

### React Input
```jsx
function Features({ features }) {
  return (
    <section className="features">
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Shopify Section Output (Multiple Block Types)
```liquid
<section class="features section-{{ section.id }}">
  <div class="container">
    {% if section.settings.heading != blank %}
      <h2>{{ section.settings.heading }}</h2>
    {% endif %}
    
    <div class="features-grid" style="--columns: {{ section.settings.columns }}">
      {% for block in section.blocks %}
        <div class="feature-item feature-item--{{ block.type }}" {{ block.shopify_attributes }}>
          {% case block.type %}
            {% when 'feature' %}
              {% if block.settings.icon != blank %}
                <div class="feature-icon">
                  {{ block.settings.icon | image_url: width: 64 | image_tag }}
                </div>
              {% endif %}
              {% if block.settings.title != blank %}
                <h3>{{ block.settings.title }}</h3>
              {% endif %}
              {% if block.settings.description != blank %}
                <p>{{ block.settings.description }}</p>
              {% endif %}
              
            {% when 'stat' %}
              <div class="stat-value">{{ block.settings.value }}</div>
              <div class="stat-label">{{ block.settings.label }}</div>
              
            {% when 'cta' %}
              {% if block.settings.text != blank %}
                <p>{{ block.settings.text }}</p>
              {% endif %}
              {% if block.settings.button_text != blank %}
                <a href="{{ block.settings.button_link }}" class="btn">
                  {{ block.settings.button_text }}
                </a>
              {% endif %}
          {% endcase %}
        </div>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .section-{{ section.id }} .features-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 2rem;
  }
  
  @media (max-width: 768px) {
    .section-{{ section.id }} .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .section-{{ section.id }} .features-grid {
      grid-template-columns: 1fr;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "Feature grid",
  "tag": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading"
    },
    {
      "type": "range",
      "id": "columns",
      "label": "Columns",
      "min": 2,
      "max": 6,
      "step": 1,
      "default": 4
    }
  ],
  "blocks": [
    {
      "type": "feature",
      "name": "Feature",
      "settings": [
        {
          "type": "image_picker",
          "id": "icon",
          "label": "Icon"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title",
          "default": "Feature"
        },
        {
          "type": "textarea",
          "id": "description",
          "label": "Description"
        }
      ]
    },
    {
      "type": "stat",
      "name": "Statistic",
      "settings": [
        {
          "type": "text",
          "id": "value",
          "label": "Value",
          "default": "100+"
        },
        {
          "type": "text",
          "id": "label",
          "label": "Label",
          "default": "Customers"
        }
      ]
    },
    {
      "type": "cta",
      "name": "Call to action",
      "settings": [
        {
          "type": "text",
          "id": "text",
          "label": "Text"
        },
        {
          "type": "text",
          "id": "button_text",
          "label": "Button text"
        },
        {
          "type": "url",
          "id": "button_link",
          "label": "Button link"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Feature grid",
      "blocks": [
        { "type": "feature" },
        { "type": "feature" },
        { "type": "feature" },
        { "type": "feature" }
      ]
    }
  ]
}
{% endschema %}
```

---

## Conversion Pattern Summary

| React/HTML Pattern | Shopify Equivalent |
|-------------------|-------------------|
| Props | `section.settings` |
| `map()` over array | `{% for block in section.blocks %}` |
| Conditional render `{condition && ...}` | `{% if setting != blank %}` |
| CSS-in-JS / inline styles | `{% style %}` block with `section.id` scoping |
| Component state | Not applicable (static) |
| Event handlers | JavaScript in `assets/` or inline |
| Children prop | Use blocks or `{{ content_for_layout }}` |
| CSS classes from props | Dynamic classes via Liquid |
| Default prop values | `| default: 'value'` filter |
