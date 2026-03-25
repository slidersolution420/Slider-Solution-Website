/**
 * Internal QA checklist — not linked from public navigation.
 * Access: /en/admin/qa (or /he/admin/qa, /es/admin/qa)
 * Purpose: Verify every item before DNS cutover to Vercel.
 */

const CHECKLIST = [
  {
    category: 'Environment Variables (Vercel)',
    items: [
      'NEXT_PUBLIC_APP_URL is set to https://slidersolution.com',
      'HYPE_API_KEY and HYPE_REFERER are set',
      'RESEND_API_KEY and RESEND_FROM_EMAIL are set',
      'OWNER_ALERT_EMAIL is set',
      'TAPUZ_CUSTOMER_CODE is set to production code (not 4041)',
      'TAPUZ_USERNAME and TAPUZ_PASSWORD are set',
      'CRON_SECRET is set',
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set',
      'SUPABASE_SERVICE_ROLE_KEY is set',
      'NEXT_PUBLIC_POSTHOG_KEY is set',
      'NEXT_PUBLIC_SENTRY_DSN is set',
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set',
    ],
  },
  {
    category: 'Core Pages',
    items: [
      'Homepage loads at /en — hero, features, how-it-works, reviews, buy-now all render',
      'Homepage loads at /he — RTL layout correct, all text translated',
      'Homepage loads at /es — all text translated',
      '/en/reviews — reviews load from Supabase (not hardcoded)',
      '/en/checkout — form renders, validation works',
      '/en/wholesale — wholesale dashboard loads',
      '/en/order/[id] — order confirmation page renders',
      'Age gate appears on first visit, persists in localStorage',
      'Exit intent popup fires on mouse leave (desktop)',
    ],
  },
  {
    category: 'Product & Cart',
    items: [
      'Color swatch toggles between black / blue / purple',
      'Product image changes with color (gradient fallback if no Cloudinary)',
      'Quantity selector increments/decrements correctly',
      'Add to cart adds correct item with color and qty',
      'Cart drawer opens and shows items',
      'Cart persists across page refreshes (localStorage)',
      'Remove from cart works',
      'Sticky cart bar appears after scrolling past hero',
    ],
  },
  {
    category: 'Currency & Pricing',
    items: [
      'Currency switcher toggles USD / EUR / ILS',
      'B2C kit price: $25 / €23 / ₪93 (approx)',
      'B2B box price: $82 (wholesale only)',
      'All prices update instantly on currency change',
      'No hardcoded prices visible in UI',
    ],
  },
  {
    category: 'Shipping',
    items: [
      'IL orders show "Free shipping in Israel"',
      'International orders < 3 units show $25 shipping',
      'International orders >= 3 units show free shipping',
      'Upgrade message shows "Add X more for free shipping"',
    ],
  },
  {
    category: 'Checkout & Payments (Hype)',
    items: [
      'Checkout form validates all fields (name, email, address)',
      'Hype payment session initiates on submit',
      'Redirect to Hype payment page works',
      'Success redirect returns to /en/order/{session_id}',
      'Cancel redirect returns to /en/checkout',
      'Webhook receives payment confirmation',
      'Order created in Supabase with status "paid"',
    ],
  },
  {
    category: 'Delivery (Tapuz)',
    items: [
      'POST /api/delivery creates shipment via Tapuz SOAP',
      'Tracking number saved to order in Supabase',
      'Order status updated to "shipped"',
      'Mock mode works when TAPUZ_CUSTOMER_CODE is 4041',
      'Production SOAP call works with real customer code',
    ],
  },
  {
    category: 'Email Flows (Resend)',
    items: [
      'Email #1 — Order confirmation sends on purchase',
      'Email #2 — How-to-use sends at Day +3 (cron)',
      'Email #3 — Leave a review sends at Day +14 (cron)',
      'Email #4 — Abandoned cart sends at +60min (cron)',
      'Email #5 — Wholesale welcome sends on approval',
      'Email #6 — Wholesale reorder sends at Day +30 (cron)',
      'Email #7 — Owner B2B alert sends on new wholesale signup',
      'All emails render correctly in dark theme',
      'Unsubscribe / reply-to addresses work',
    ],
  },
  {
    category: 'Wholesale (B2B)',
    items: [
      'Wholesale modal opens from nav link',
      'Signup form validates all fields',
      'Account created in Supabase with status "active"',
      'Wholesale welcome email sent',
      'Owner B2B alert email sent',
      'Wholesale dashboard shows after login',
      'B2B pricing visible to authenticated wholesale users only',
    ],
  },
  {
    category: 'SEO & OG',
    items: [
      'og-image.png exists in /public and renders',
      'Meta title: "Slider Solution — The Original All-in-One Cone Kit"',
      'Meta description present and accurate',
      'Robots: index, follow',
      'Favicon loads correctly',
      'Canonical URL resolves to slidersolution.com',
    ],
  },
  {
    category: 'Performance',
    items: [
      'Lighthouse Performance score > 90',
      'LCP element (hero image) loads with priority',
      'No layout shift on color change',
      'Fonts preloaded (Syne, Outfit)',
      'Images optimized via Cloudinary f_auto,q_auto',
    ],
  },
  {
    category: 'Security',
    items: [
      'Supabase RLS enabled on all tables',
      'Service role key never exposed to client',
      'CRON_SECRET required on cron endpoints',
      'Hype webhook signature verified',
      'No secrets in client-side code',
      'HTTPS enforced via Vercel',
    ],
  },
  {
    category: 'DNS Cutover',
    items: [
      'All above items verified and passing',
      'Owner has approved DNS switch',
      'Update A/CNAME records to point to Vercel',
      'Verify SSL certificate provisioned',
      'Test all flows on production domain',
      'Monitor Sentry and PostHog for errors post-cutover',
    ],
  },
]

export default function QAChecklistPage() {
  return (
    <div className="min-h-screen bg-[#07080F] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-syne font-bold text-white">
            QA Checklist — Pre-Launch
          </h1>
          <p className="text-gray-400 font-outfit">
            Verify every item before DNS cutover from WordPress to Vercel.
            This page is internal only and not linked from the public site.
          </p>
        </div>

        {CHECKLIST.map((section) => (
          <div
            key={section.category}
            className="bg-[#0F1629] rounded-2xl border border-white/5 p-6 space-y-4"
          >
            <h2 className="text-lg font-syne font-bold text-purple-400">
              {section.category}
            </h2>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 shrink-0"
                    aria-label={item}
                  />
                  <span className="text-gray-300 font-outfit text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="text-center text-gray-500 font-outfit text-xs pt-8">
          Slider Solution — Internal QA · Not for public distribution
        </div>
      </div>
    </div>
  )
}
