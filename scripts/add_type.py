import pandas as pd

nit = pd.read_json("../backend/josaa.json")
iiit = pd.read_json("../backend/josaa_iiit.json")

nit["Institute Type"] = "NIT"
iiit["Institute Type"] = "IIIT"

combined = pd.concat([nit, iiit], ignore_index=True)
combined = combined.drop_duplicates()

combined.to_json("../backend/josaa_all.json", orient="records")

print("✅ Final merged JSON ready")