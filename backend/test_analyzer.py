import unittest
from backend.analyzer import verify_quote, validate_analysis_evidence

class TestAnalyzer(unittest.TestCase):

    def setUp(self):
        # Setup mock raw reviews
        self.raw_reviews = [
            {
                "review_id": "r1",
                "review_text": "Blinkit delivered my groceries incredibly fast, but the apples were bruised.",
                "rating": 3,
                "source": "play_store",
                "platform": "android",
                "sentiment": "neutral"
            },
            {
                "review_id": "r2",
                "review_text": "I only purchase dairy here. I do not explore personal care.",
                "rating": 4,
                "source": "app_store",
                "platform": "ios",
                "sentiment": "positive"
            }
        ]

    def test_verify_quote(self):
        # Test exact match
        review_text = "I only purchase dairy here. I do not explore personal care."
        self.assertTrue(verify_quote("purchase dairy here", review_text))
        
        # Test case-insensitivity
        self.assertTrue(verify_quote("PURCHASE DAIRY HERE", review_text))
        
        # Test spacing variance
        self.assertTrue(verify_quote("purchase   dairy  here", review_text))
        
        # Test quotes surrounding the text (should be stripped)
        self.assertTrue(verify_quote('"purchase dairy here"', review_text))
        self.assertTrue(verify_quote('“purchase dairy here”', review_text))
        
        # Test failure/mismatch
        self.assertFalse(verify_quote("purchase vegetables", review_text))
        
        # Test empty cases
        self.assertFalse(verify_quote("", review_text))
        self.assertFalse(verify_quote("purchase dairy", ""))

    def test_validate_analysis_evidence(self):
        # Setup mock raw analysis response from LLM
        mock_analysis = {
            "themes": [
                # 1. Valid theme (contains valid quotes and review ID)
                {
                    "theme_id": "theme_1",
                    "title": "Fast Grocery Delivery",
                    "description": "Customers praise delivery speed.",
                    "supporting_reviews": [
                        {"review_id": "r1", "quote": "groceries incredibly fast"}
                    ]
                },
                # 2. Theme with invalid quote (should be filtered)
                {
                    "theme_id": "theme_2",
                    "title": "Fresh Vegetables",
                    "description": "People buying vegetables.",
                    "supporting_reviews": [
                        {"review_id": "r1", "quote": "delivered fresh cabbage"}
                    ]
                },
                # 3. Theme with phantom review ID (should be filtered)
                {
                    "theme_id": "theme_3",
                    "title": "App Stability",
                    "description": "App crashes a lot.",
                    "supporting_reviews": [
                        {"review_id": "r99", "quote": "app crashed"}
                    ]
                }
            ],
            "behaviors": [
                # Valid behavior (contains one valid quote and one invalid quote)
                {
                    "behavior_type": "Category Loyalty",
                    "description": "Only buying dairy.",
                    "supporting_reviews": [
                        {"review_id": "r2", "quote": "only purchase dairy"},
                        {"review_id": "r2", "quote": "purchase personal care products"} # invalid quote
                    ]
                }
            ],
            "jtbd": [],
            "pain_points": []
        }
        
        validated = validate_analysis_evidence(mock_analysis, self.raw_reviews)
        
        # Check themes:
        # theme_1 should be kept and validated (size should be 1, platform and source injected)
        self.assertEqual(len(validated["themes"]), 1)
        self.assertEqual(validated["themes"][0]["theme_id"], "theme_1")
        self.assertEqual(validated["themes"][0]["size"], 1)
        self.assertEqual(validated["themes"][0]["supporting_reviews"][0]["platform"], "android")
        self.assertEqual(validated["themes"][0]["supporting_reviews"][0]["source"], "play_store")
        
        # theme_2 (invalid quote) and theme_3 (phantom ID) should be dropped completely as they have 0 valid quotes left
        # Check behaviors:
        # loyalty behavior should remain but have only 1 supporting review (invalid one dropped)
        self.assertEqual(len(validated["behaviors"]), 1)
        self.assertEqual(len(validated["behaviors"][0]["supporting_reviews"]), 1)
        self.assertEqual(validated["behaviors"][0]["supporting_reviews"][0]["review_id"], "r2")
        self.assertEqual(validated["behaviors"][0]["supporting_reviews"][0]["platform"], "ios")

if __name__ == '__main__':
    unittest.main()
