import unittest

from addressql import (
    address_match,
    country_resolve,
    delivery_available,
    normalize_address,
    postal_normalize,
    postal_status,
    postal_validate,
)


class AddressQlSdkTest(unittest.TestCase):
    def test_country_and_postal_metadata(self):
        self.assertEqual(country_resolve("Nihon")["country_code"], "JP")
        self.assertEqual(postal_status("HK"), "none")
        self.assertEqual(postal_normalize("1000001", "JP"), "100-0001")

    def test_validation_and_delivery_non_claims(self):
        postal = postal_validate("1000001", "JP")
        delivery = delivery_available("HK", "", "synthetic_carrier")

        self.assertTrue(postal["valid"])
        self.assertIn("not full address identity", " ".join(postal["non_claims"]))
        self.assertTrue(delivery["available"])
        self.assertIn("not proof of residence", " ".join(delivery["non_claims"]))

    def test_matching_is_purpose_relative(self):
        a = normalize_address("Synthetic US Fixture Street", "US")
        b = normalize_address(" Synthetic   US Fixture   Street ", "US")
        decision = address_match(a, b, "delivery")

        self.assertTrue(decision["match"])
        self.assertEqual(decision["purpose"], "delivery")
        self.assertIn("not proof of residence", " ".join(decision["non_claims"]))


if __name__ == "__main__":
    unittest.main()
