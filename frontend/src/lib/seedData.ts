// Seeded from data/processed/analysis_results.json — used as default state
// when no fresh analysis run has been performed in this session.
import type { AnalysisResult } from "@/types";

export const SEED_ANALYSIS: AnalysisResult = {
  run_id: "seed_default",
  timestamp: "2026-07-14T22:00:00.000Z",
  source: "Google Play Store + Apple App Store",
  app_id: "com.blinkit.consumer",
  stats: {
    original_count: 200,
    cleaned_count: 165,
    duplicates_removed: 22,
    non_english_removed: 13,
  },
  source_counts: {
    play_store: 50,
    app_store: 150,
    csv_upload: 0,
  },
  sentiments: {
    positive: 98,
    neutral: 37,
    negative: 30,
  },
  themes: [
    {
      theme_id: "theme_1",
      title: "Delivery Experience & Efficiency",
      description:
        "Customers frequently comment on the speed, professionalism, and behavior of delivery personnel, ranging from excellent doorstep service to rude language and concerns about rider safety due to time pressures.",
      supporting_reviews: [
        { review_id: "1f5ea8e2", quote: "delivery person used rough and abuse language", platform: "android", source: "play_store" },
        { review_id: "14297842420", quote: "ordered the products i needed and working 8 minutes got it delivered at home. wow, time saved.", platform: "ios", source: "app_store" },
        { review_id: "14297363818", quote: "delivery agents are rude", platform: "ios", source: "app_store" },
        { review_id: "14296990973", quote: "have to increase delivery time for delivery boys and girls for life safety.", platform: "ios", source: "app_store" },
        { review_id: "14296937227", quote: "taking longer time 18 min 20 min", platform: "ios", source: "app_store" },
        { review_id: "14296909488", quote: "orders promptly delivered with convenience of sitting at home.", platform: "ios", source: "app_store" },
        { review_id: "14296716239", quote: "delivery personnel are quick and come all the way to the doorstep and are very professional.", platform: "ios", source: "app_store" },
      ],
      size: 7,
    },
    {
      theme_id: "theme_2",
      title: "Product Quality & Order Accuracy",
      description:
        "Customers express concerns about receiving incorrect, expired, or spoiled products, highlighting issues with quality control and accurate order fulfillment.",
      supporting_reviews: [
        { review_id: "14297465621", quote: "they deliver wrong products", platform: "ios", source: "app_store" },
        { review_id: "14296832918", quote: "i received expired products, and some items even had fungus on them.", platform: "ios", source: "app_store" },
      ],
      size: 2,
    },
    {
      theme_id: "theme_3",
      title: "Customer Support & Refund Process",
      description:
        "There is significant frustration over unresponsive or unhelpful customer support, complicated refund procedures, and the inability to resolve issues like wrong products or undelivered prepaid orders.",
      supporting_reviews: [
        { review_id: "14297465621", quote: "keep asking you to get back to them again and again", platform: "ios", source: "app_store" },
        { review_id: "14296763962", quote: "my order was prepaid... till today i didn't get my refund as well...", platform: "ios", source: "app_store" },
      ],
      size: 4,
    },
    {
      theme_id: "theme_4",
      title: "Pricing & Value Perception",
      description:
        "Customers express concerns about high delivery charges and product prices compared to traditional stores, impacting their perception of value.",
      supporting_reviews: [
        { review_id: "14297859225", quote: "too costly delivery charge", platform: "ios", source: "app_store" },
        { review_id: "14297363818", quote: "some prices are higher compared to normal shops", platform: "ios", source: "app_store" },
      ],
      size: 2,
    },
    {
      theme_id: "theme_5",
      title: "Overall Service Satisfaction",
      description:
        "General positive feedback and appreciation for the app's overall service and convenience.",
      supporting_reviews: [
        { review_id: "7b0286af", quote: "too good from other apps!", platform: "android", source: "play_store" },
        { review_id: "14296988384", quote: "best ever: blinkit is the best so far..", platform: "ios", source: "app_store" },
        { review_id: "14296716239", quote: "great amenity and tool: great for last minute work and deliveries.", platform: "ios", source: "app_store" },
      ],
      size: 3,
    },
  ],
  behaviors: [
    {
      behavior_type: "Urgency-driven / Time-sensitive Shopping",
      description: "Customers frequently use the service for immediate or last-minute needs, highly valuing speed and the ability to save time.",
      supporting_reviews: [
        { review_id: "14297842420", quote: "good option if you are short of time: i was expecting guest in 15 minutes and had no time to visit market.", platform: "ios", source: "app_store" },
        { review_id: "14296716239", quote: "great for last minute work and deliveries.", platform: "ios", source: "app_store" },
      ],
    },
    {
      behavior_type: "Convenience-seeking",
      description: "Users prioritize the ease of doorstep delivery and avoiding physical market visits as a key benefit of the service.",
      supporting_reviews: [
        { review_id: "14296909488", quote: "orders promptly delivered with convenience of sitting at home.", platform: "ios", source: "app_store" },
      ],
    },
    {
      behavior_type: "Quality & Trust-conscious",
      description: "Customers expect high-quality, fresh, and accurate products alongside a trustworthy service that delivers as promised.",
      supporting_reviews: [
        { review_id: "14296832918", quote: "i received expired products, and some items even had fungus on them. selling spoiled food is completely unacceptable.", platform: "ios", source: "app_store" },
      ],
    },
    {
      behavior_type: "Price-sensitive / Value-seeking",
      description: "Customers are mindful of delivery charges and product prices, comparing them to traditional shopping options.",
      supporting_reviews: [
        { review_id: "14297859225", quote: "too costly delivery charge", platform: "ios", source: "app_store" },
      ],
    },
  ],
  jtbd: [
    {
      jtbd_statement: "When I'm short on time or have unexpected needs, I want to quickly and reliably replenish groceries and essentials, so I can save time and be prepared without leaving my home.",
      supporting_reviews: [
        { review_id: "14297842420", quote: "ordered the products i needed and working 8 minutes got it delivered at home. wow, time saved.", platform: "ios", source: "app_store" },
        { review_id: "14296909488", quote: "orders promptly delivered with convenience of sitting at home.", platform: "ios", source: "app_store" },
      ],
    },
    {
      jtbd_statement: "When I order products online, I want to receive fresh, unexpired, and accurate items, so I can trust the quality of my purchases and ensure the safety of what I consume.",
      supporting_reviews: [
        { review_id: "14296832918", quote: "i expected fresh products but instead received items that were unsafe to consume.", platform: "ios", source: "app_store" },
        { review_id: "14297465621", quote: "they deliver wrong products", platform: "ios", source: "app_store" },
      ],
    },
    {
      jtbd_statement: "When an issue arises with my order (wrong product, undelivered, expired), I want efficient, fair, and transparent customer support so I can resolve the problem without hassle or extra cost.",
      supporting_reviews: [
        { review_id: "14297465621", quote: "keep asking you to get back to them again and again", platform: "ios", source: "app_store" },
        { review_id: "14296763962", quote: "my order was prepaid... till today i didn't get my refund as well...", platform: "ios", source: "app_store" },
      ],
    },
    {
      jtbd_statement: "When I choose an online delivery service, I want fair pricing and professional, courteous service, so I feel like I'm getting good value and a pleasant experience.",
      supporting_reviews: [
        { review_id: "14297859225", quote: "too costly delivery charge it should be less for more better service", platform: "ios", source: "app_store" },
        { review_id: "1f5ea8e2", quote: "delivery person used rough and abuse language", platform: "android", source: "play_store" },
      ],
    },
  ],
  pain_points: [
    {
      issue: "Rude / Unprofessional Delivery Personnel",
      root_cause: "Insufficient training, lack of behavioral guidelines enforcement, or inadequate grievance mechanisms for customers regarding delivery staff conduct.",
      supporting_reviews: [
        { review_id: "1f5ea8e2", quote: "delivery person used rough and abuse language", platform: "android", source: "play_store" },
        { review_id: "14297363818", quote: "delivery agents are rude", platform: "ios", source: "app_store" },
      ],
    },
    {
      issue: "Poor Product Quality & Accuracy",
      root_cause: "Inadequate quality control at fulfillment centers, poor inventory management leading to expired stock, or errors in order picking and packing processes.",
      supporting_reviews: [
        { review_id: "14297465621", quote: "they deliver wrong products", platform: "ios", source: "app_store" },
        { review_id: "14296832918", quote: "i received expired products, and some items even had fungus on them.", platform: "ios", source: "app_store" },
      ],
    },
    {
      issue: "Ineffective Customer Support & Refund Process",
      root_cause: "Inefficient customer service protocols, restrictive refund policies, or poor communication regarding refund status.",
      supporting_reviews: [
        { review_id: "14297465621", quote: "keep asking you to get back to them again and again", platform: "ios", source: "app_store" },
        { review_id: "14296763962", quote: "till today i didn't get my refund as well...", platform: "ios", source: "app_store" },
      ],
    },
    {
      issue: "High Delivery Charges & Product Pricing",
      root_cause: "Pricing strategy that may not align with customer value perception, potentially higher operational costs for ultra-fast delivery.",
      supporting_reviews: [
        { review_id: "14297859225", quote: "too costly delivery charge", platform: "ios", source: "app_store" },
        { review_id: "14297363818", quote: "some prices are higher compared to normal shops", platform: "ios", source: "app_store" },
      ],
    },
    {
      issue: "Inconsistent Delivery Speed / Unsafe Practices",
      root_cause: "Operational inconsistencies impacting delivery times, potentially aggressive internal targets for speed that compromise rider safety.",
      supporting_reviews: [
        { review_id: "14296937227", quote: "taking longer time 18 min 20 min", platform: "ios", source: "app_store" },
        { review_id: "14296990973", quote: "have to increase delivery time for delivery boys and girls for life safety.", platform: "ios", source: "app_store" },
      ],
    },
    {
      issue: "Fraudulent Delivery Status Updates",
      root_cause: "Lack of stringent verification and accountability mechanisms for delivery personnel.",
      supporting_reviews: [
        { review_id: "14296763962", quote: "the delivery boy didn't delivered my order inspite of this he update my order status as updated", platform: "ios", source: "app_store" },
      ],
    },
  ],
};
