import pandas as pd

df = pd.read_csv("../data/josaa_iiit.csv")

print("Initial rows:", len(df))


# -------------------------------
# 1. Extract numeric ranks safely
# -------------------------------
df["Opening Rank"] = df["Opening Rank"].astype(str).str.extract(r'(\d+)')
df["Closing Rank"] = df["Closing Rank"].astype(str).str.extract(r'(\d+)')
print("After extracting numeric ranks:", len(df))

# -------------------------------
# 2. Remove rows where rank missing
# -------------------------------
df = df.dropna(subset=["Closing Rank"])

print("After removing invalid rows:", len(df))


# -------------------------------
# 3. Convert to int
# -------------------------------
df["Opening Rank"] = pd.to_numeric(df["Opening Rank"], errors="coerce")
df["Closing Rank"] = pd.to_numeric(df["Closing Rank"], errors="coerce")

df = df.dropna(subset=["Closing Rank"])

df["Opening Rank"] = df["Opening Rank"].astype(int)
df["Closing Rank"] = df["Closing Rank"].astype(int)

print("After converting ranks:", len(df))


# -------------------------------
# 4. Clean text
# -------------------------------
text_cols = ["Institute", "Program", "Quota", "Seat Type", "Gender"]

for col in text_cols:
    df[col] = df[col].astype(str).str.strip()


# -------------------------------
# 5. Fix Round column
# -------------------------------
df["Round"] = pd.to_numeric(df["Round"], errors="coerce")
df = df.dropna(subset=["Round"])
df["Round"] = df["Round"].astype(int)


# -------------------------------
# 6. Remove duplicates
# -------------------------------
df = df.drop_duplicates()


# -------------------------------
# 7. Sort
# -------------------------------
df = df.sort_values(by=["Round", "Closing Rank"])

print("First 5 rows after sorting:")
print(df.head())


print("Cleaned rows:", len(df))


# -------------------------------
# 8. Save
# -------------------------------
df.to_csv("../data/josaa_clean_iiit.csv", index=False)
df.to_json("../backend/josaa_iiit.json", orient="records")

print("✅ Clean dataset ready")