import unittest
import os
import json
import shutil
from backend.processor import (
    validate_review,
    strip_emojis,
    mask_pii,
    clean_text,
    is_spam_or_noise,
    detect_review_language,
    preprocess_reviews
)

class TestProcessor(unittest.TestCase):

    def setUp(self):
        # Create a mock valid review structure
        self.valid_review = {
            "review_id": "test_123",
            "review_text": "This is a great app for groceries, highly recommended!",
            "rating": 5,
            "source": "play_store",
            "timestamp": "2026-07-14T10:00:00",
            "username": "John Doe",
            "platform": "android"
        }

    def test_validate_review(self):
        # Test valid review
        self.assertTrue(validate_review(self.valid_review))
        
        # Test missing key
        bad_review = self.valid_review.copy()
        del bad_review["rating"]
        self.assertFalse(validate_review(bad_review))
        
        # Test invalid type
        bad_review_2 = self.valid_review.copy()
        bad_review_2["rating"] = "five"  # string instead of int
        self.assertFalse(validate_review(bad_review_2))
        
        # Test invalid platform
        bad_review_3 = self.valid_review.copy()
        bad_review_3["platform"] = "windows_phone"
        self.assertFalse(validate_review(bad_review_3))

    def test_strip_emojis(self):
        # Test basic text
        self.assertEqual(strip_emojis("hello"), "hello")
        # Test emojis
        self.assertEqual(strip_emojis("Love the app! 👍🚀"), "Love the app! ")
        # Test keeping punctuation and symbols like $ and +
        self.assertEqual(strip_emojis("I paid $10 + tax. ❤️"), "I paid $10 + tax. ")

    def test_mask_pii(self):
        # Test email masking
        self.assertEqual(
            mask_pii("Contact me at test@example.com for help"),
            "Contact me at [REDACTED_EMAIL] for help"
        )
        
        # Test URL masking
        self.assertEqual(
            mask_pii("Visit http://google.com or https://www.facebook.com"),
            "Visit [REDACTED_URL] or [REDACTED_URL]"
        )
        
        # Test Phone number masking
        self.assertEqual(
            mask_pii("Call +91-9876543210 or 9876543210"),
            "Call [REDACTED_PHONE] or [REDACTED_PHONE]"
        )

    def test_clean_text(self):
        # Combined strip emojis, PII mask, whitespace normalization and lowercase
        raw_text = "  Contact me at TEST@example.com!  Love the app 👍   "
        self.assertEqual(
            clean_text(raw_text),
            "contact me at [redacted_email]! love the app"
        )

    def test_is_spam_or_noise(self):
        # Short review
        self.assertTrue(is_spam_or_noise("nice app"))
        self.assertTrue(is_spam_or_noise("ok"))
        
        # Long review (not spam)
        self.assertFalse(is_spam_or_noise("i love buying groceries on this application"))
        
        # Review with only PII tokens (spam)
        self.assertTrue(is_spam_or_noise("[redacted_url]"))
        self.assertTrue(is_spam_or_noise("[redacted_phone] [redacted_email]"))

    def test_detect_review_language(self):
        # English review
        self.assertEqual(detect_review_language("This is a grocery delivery app"), "en")
        
        # Spanish review
        self.assertEqual(detect_review_language("Esta aplicación de entrega es genial"), "es")
        
        # Unknown/symbol only
        self.assertEqual(detect_review_language("1234567890"), "unknown")

    def test_preprocess_reviews_pipeline(self):
        # List of mock reviews for the pipeline
        reviews = [
            # 1. Valid review (should pass)
            {
                "review_id": "r1",
                "review_text": "Awesome delivery and fresh fruits! 👍",
                "rating": 5,
                "source": "play_store",
                "timestamp": "2026-07-14T10:00:00",
                "username": "User A",
                "platform": "android"
            },
            # 2. Duplicate of r1
            {
                "review_id": "r2",
                "review_text": "Awesome delivery and fresh fruits! 👍",
                "rating": 4,
                "source": "play_store",
                "timestamp": "2026-07-14T10:05:00",
                "username": "User B",
                "platform": "android"
            },
            # 3. Spam review (short)
            {
                "review_id": "r3",
                "review_text": "Good app.",
                "rating": 3,
                "source": "play_store",
                "timestamp": "2026-07-14T10:10:00",
                "username": "User C",
                "platform": "android"
            },
            # 4. Non-English review
            {
                "review_id": "r4",
                "review_text": "Esta aplicacion es muy rapida y buena.",
                "rating": 5,
                "source": "play_store",
                "timestamp": "2026-07-14T10:15:00",
                "username": "User D",
                "platform": "android"
            },
            # 5. Invalid schema (missing platform)
            {
                "review_id": "r5",
                "review_text": "This is a valid review text, but missing platform.",
                "rating": 5,
                "source": "play_store",
                "timestamp": "2026-07-14T10:20:00",
                "username": "User E"
            }
        ]
        
        # Run preprocessing
        clean_reviews, stats = preprocess_reviews(reviews)
        
        # Assertions
        self.assertEqual(len(clean_reviews), 1)
        self.assertEqual(clean_reviews[0]["review_id"], "r1")
        # Emojis stripped, lowercase
        self.assertEqual(clean_reviews[0]["review_text"], "awesome delivery and fresh fruits!")
        
        # Check stats counts
        self.assertEqual(stats["total_reviews"], 5)
        self.assertEqual(stats["valid_reviews"], 4) # r5 is invalid, so 4 valid
        self.assertEqual(stats["duplicate_reviews_removed"], 1) # r2 is duplicate
        self.assertEqual(stats["spam_removed"], 1) # r3 is spam (2 words)
        self.assertEqual(stats["unsupported_languages"], 1) # r4 is spanish
        self.assertEqual(stats["final_clean_reviews"], 1)
        
        # Verify file creation
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        processed_dir = os.path.join(project_root, "data", "processed")
        
        self.assertTrue(os.path.exists(os.path.join(processed_dir, "processed_reviews.json")))
        self.assertTrue(os.path.exists(os.path.join(processed_dir, "preprocessing_stats.json")))

if __name__ == '__main__':
    unittest.main()
