# Guide de Conversion Shopify

## Résumé de la Structure Actuelle

### Pages principales :
- **Index** (`/`) - Page d'accueil avec HeroSection, BenefitsSection, TestimonialsSection, CTASection
- **Product** (`/product`) - Page produit avec ProductImage, ProductInfo, ProductTabs

### Composants à convertir :

#### 1. HeroSection.tsx
- **Fonction**: Hero principal avec CTA vers produit
- **Éléments Shopify**: Remplacer liens par `{{ product.url }}`
- **Animations**: Convertir classes CSS personnalisées

#### 2. ProductImage.tsx  
- **Fonction**: Galerie d'images produit avec thumbnails
- **Éléments Shopify**: Utiliser `{{ product.images }}` et `{{ image | img_url }}`
- **Structure**: Gallery avec sélection d'image active

#### 3. ProductInfo.tsx
- **Fonction**: Infos produit, prix, variants, add to cart
- **Éléments Shopify**: 
  - Prix: `{{ product.price | money }}`
  - Variants: `{{ product.variants }}`
  - Form: `{% form 'product', product %}`

#### 4. ProductTabs.tsx
- **Fonction**: Onglets description, specs, avis, livraison
- **Éléments Shopify**: `{{ product.description }}`, metafields

## Classes CSS à Convertir

### Classes personnalisées utilisées :
```css
.gradient-text - Texte avec dégradé
.card-cloud - Cartes avec effet verre/backdrop-blur
.btn-cloud - Boutons avec dégradé et effets hover
.animate-float - Animation flottante
.animate-fade-in-up - Animation apparition
.animate-pulse-soft - Animation pulse douce
```

### Couleurs personnalisées à remplacer :
```css
sky-blue: #87CEEB
cloud-white: #F8FAFC  
lavender: #E6E6FA
pastel-pink: #FFB6C1
soft-gray: #F1F5F9
mint-fresh: #F0FFFF
```

## Actions Recommandées pour ChatGPT

1. **Créer les templates Liquid** :
   - `index.liquid` (homepage)
   - `product.liquid` (page produit)
   - `sections/hero.liquid`
   - `sections/product-gallery.liquid`
   - `sections/product-form.liquid`

2. **Convertir les styles** :
   - Extraire toutes les classes Tailwind utilisées
   - Convertir les animations en CSS pur ou SCSS
   - Adapter les couleurs au système de variables Shopify

3. **Intégrations Shopify nécessaires** :
   - Form add to cart avec variants
   - Calculs de prix avec taxes
   - Gestion du panier
   - Système d'avis produits

4. **Structure des fichiers recommandée** :
```
/sections/
  - hero.liquid
  - product-gallery.liquid  
  - product-info.liquid
  - product-tabs.liquid
  - benefits.liquid
  - testimonials.liquid

/templates/
  - index.liquid
  - product.liquid

/assets/
  - styles.css (classes converties)
  - scripts.js (interactions)
```

## Points d'Attention

- ✅ Tous les composants sont bien structurés et modulaires
- ✅ Design responsive implémenté
- ✅ Fonctionnalités e-commerce présentes (variants, quantité, add to cart)
- ⚠️ Animations complexes à simplifier pour Shopify
- ⚠️ État du panier géré côté React (à adapter pour Shopify)
- ⚠️ Couleurs en dur à remplacer par variables CSS

Le code est bien organisé et prêt pour la conversion !