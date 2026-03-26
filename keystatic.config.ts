import { config, fields, collection, singleton } from '@keystatic/core'

export default config({
  storage:
    process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_SECRET
      ? {
          kind: 'github' as const,
          repo: {
            owner: 'slidersolution420',
            name: 'Slider-Solution-Website',
          },
        }
      : { kind: 'local' as const },

  ui: {
    brand: { name: 'Slider Solution CMS' },
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site Settings',
      path: 'content/singletons/site-settings',
      schema: {
        phone: fields.text({ label: 'Phone', defaultValue: '052-455-3311' }),
        email: fields.text({ label: 'Contact Email', defaultValue: 'support@slidersolution.com' }),
        address: fields.text({ label: 'Address' }),
        instagram_url: fields.url({ label: 'Instagram URL' }),
        facebook_url: fields.url({ label: 'Facebook URL' }),
        whatsapp_number: fields.text({ label: 'WhatsApp Number (with country code, e.g. +972501234567)' }),
        ticker_he: fields.text({
          label: 'Ticker Bar Text (Hebrew)',
          defaultValue: '✦ משלוח חינם בכל הארץ ✦ ממציאי הסלייד המקוריים ✦',
        }),
        ticker_en: fields.text({
          label: 'Ticker Bar Text (English)',
          defaultValue: '✦ Free Shipping Nationwide ✦ The Original Slider Kit ✦',
        }),
        age_gate_enabled: fields.checkbox({ label: 'Enable Age Gate (21+)', defaultValue: true }),
        how_it_works_video1_id: fields.text({ label: 'How It Works — Video 1 YouTube ID', defaultValue: '' }),
        how_it_works_video2_id: fields.text({ label: 'How It Works — Video 2 YouTube ID', defaultValue: '' }),
        instagram_reels: fields.array(
          fields.object({
            video_url: fields.text({ label: 'Video URL (e.g. Supabase Storage MP4)' }),
            link_url: fields.url({ label: 'Instagram Reel Link (optional)' }),
          }),
          { label: 'Instagram Reels' }
        ),
      },
    }),

    product: singleton({
      label: 'Product',
      path: 'content/singletons/product',
      schema: {
        name: fields.text({ label: 'Product Name', defaultValue: 'SLIDER' }),
        tagline_he: fields.text({
          label: 'Tagline (Hebrew)',
          defaultValue: 'קיט הגלגול המושלם',
        }),
        tagline_en: fields.text({
          label: 'Tagline (English)',
          defaultValue: 'The Original All-in-One Cone Kit',
        }),
        description_he: fields.text({
          label: 'Hero Description (Hebrew)',
          multiline: true,
          defaultValue:
            'קיט ה-ALL IN ONE הראשון בעולם שמותאם גם לאלו שלא יודעים לגלגל',
        }),
        description_en: fields.text({
          label: 'Hero Description (English)',
          multiline: true,
          defaultValue:
            "The world's first ALL IN ONE kit adapted even for those who don't know how to roll",
        }),
        price_b2c_usd: fields.number({ label: 'B2C Price (USD)', defaultValue: 25 }),
        price_b2b_usd: fields.number({ label: 'B2B Box Price (USD)', defaultValue: 82 }),
        image_b2c: fields.text({
          label: 'B2C Product Image Filename (in Supabase Storage)',
          defaultValue: 'kit-main.jpg',
        }),
        image_b2b: fields.text({
          label: 'B2B Display Box Image Filename',
          defaultValue: 'display-box.jpg',
        }),
        colors: fields.array(
          fields.object({
            name_he: fields.text({ label: 'Color Name (Hebrew)' }),
            name_en: fields.text({ label: 'Color Name (English)' }),
            slug: fields.text({ label: 'Slug (e.g. black, blue, purple)' }),
            image: fields.text({ label: 'Image Filename' }),
            gradient: fields.text({
              label: 'Tailwind Gradient (fallback)',
              defaultValue: 'from-gray-800 to-gray-900',
            }),
          }),
          {
            label: 'Colors',
            itemLabel: (props) => props.fields.name_en.value ?? 'Color',
          }
        ),
        features: fields.array(
          fields.object({
            title_he: fields.text({ label: 'Title (Hebrew)' }),
            title_en: fields.text({ label: 'Title (English)' }),
            desc_he: fields.text({ label: 'Description (Hebrew)', multiline: true }),
            desc_en: fields.text({ label: 'Description (English)', multiline: true }),
            icon: fields.select({
              label: 'Icon',
              options: [
                { label: 'Cog', value: 'cog' },
                { label: 'Funnel', value: 'funnel' },
                { label: 'Archive Box', value: 'archive-box' },
                { label: 'Shield', value: 'shield' },
              ],
              defaultValue: 'cog',
            }),
          }),
          {
            label: 'Features (4)',
            itemLabel: (props) => props.fields.title_en.value ?? 'Feature',
          }
        ),
        steps: fields.array(
          fields.object({
            title_he: fields.text({ label: 'Step Title (Hebrew)' }),
            title_en: fields.text({ label: 'Step Title (English)' }),
            desc_he: fields.text({ label: 'Step Description (Hebrew)', multiline: true }),
            desc_en: fields.text({ label: 'Step Description (English)', multiline: true }),
          }),
          {
            label: 'How It Works Steps (3)',
            itemLabel: (props) => props.fields.title_en.value ?? 'Step',
          }
        ),
        kit_contents_he: fields.array(fields.text({ label: 'Item (Hebrew)' }), {
          label: 'Kit Contents (Hebrew)',
        }),
        kit_contents_en: fields.array(fields.text({ label: 'Item (English)' }), {
          label: 'Kit Contents (English)',
        }),
        stock: fields.number({
          label: 'Stock (0 = out of stock)',
          defaultValue: 999,
        }),
      },
    }),

    shippingSettings: singleton({
      label: 'Shipping Settings',
      path: 'content/singletons/shipping-settings',
      schema: {
        free_shipping_countries: fields.array(
          fields.text({ label: 'Country Code (e.g. IL)' }),
          { label: 'Free Shipping Countries' }
        ),
        free_shipping_min_qty: fields.number({
          label: 'Min Qty for Free International Shipping',
          defaultValue: 3,
        }),
        intl_paid_shipping_usd: fields.number({
          label: 'International Shipping Cost (USD)',
          defaultValue: 25,
        }),
      },
    }),
  },

  collections: {
    faq: collection({
      label: 'FAQ',
      path: 'content/faq/*',
      slugField: 'question_en',
      format: { data: 'json' },
      schema: {
        question_he: fields.text({ label: 'Question (Hebrew)' }),
        question_en: fields.text({ label: 'Question (English)' }),
        answer_he: fields.text({ label: 'Answer (Hebrew)', multiline: true }),
        answer_en: fields.text({ label: 'Answer (English)', multiline: true }),
        order: fields.number({ label: 'Sort Order', defaultValue: 0 }),
      },
    }),

    pages: collection({
      label: 'Pages',
      path: 'content/pages/*',
      slugField: 'slug',
      format: { contentField: 'body' },
      schema: {
        title_he: fields.text({ label: 'Title (Hebrew)' }),
        title_en: fields.text({ label: 'Title (English)' }),
        slug: fields.text({ label: 'URL Slug (e.g. terms, refund, cookies)' }),
        body: fields.mdx({ label: 'Content' }),
      },
    }),
  },
})
