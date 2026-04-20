
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select ,WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time
from selenium.common.exceptions import TimeoutException, NoSuchElementException


options = Options()
options.add_argument("--start-maximized")  # Run in headless mode (no browser window)

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 20)  # Wait up to 20 seconds for elements to load

url = "https://josaa.admissions.nic.in/applicant/SeatAllotmentResult/CurrentORCR.aspx"

rounds = ["1", "2", "3", "4", "5", "6"]

all_data = []

print(type(wait))
for r in rounds:
    try:
        driver.get(url)
        print(f"Navigating to URL: {url}")
        time.sleep(5)  # Wait for the page to load

        driver.execute_script("""var ddl = document.getElementById('ctl00_ContentPlaceHolder1_ddlroundno');ddl.value = arguments[0];__doPostBack('ctl00$ContentPlaceHolder1$ddlroundno','');""", r)
        print(f"✅ Round set to {r}")
        time.sleep(3)

        driver.execute_script("""
        var ddl = document.getElementById('ctl00_ContentPlaceHolder1_ddlInstype');
        ddl.value = 'NIT';
        __doPostBack('ctl00$ContentPlaceHolder1$ddlInstype','');
        """)
        print("✅ Institute Type set to NIT")
        time.sleep(3)

        driver.execute_script("""
        document.getElementById('ctl00_ContentPlaceHolder1_ddlInstitute').value = 'ALL';
        __doPostBack('ctl00$ContentPlaceHolder1$ddlInstitute','');
        """)
        print("✅ Institute set to ALL")
        time.sleep(3)

        driver.execute_script("""
        document.getElementById('ctl00_ContentPlaceHolder1_ddlBranch').value = 'ALL';
        __doPostBack('ctl00$ContentPlaceHolder1$ddlBranch','');
        """)
        print("✅ Branch set to ALL")
        time.sleep(3)

        driver.execute_script("""
        document.getElementById('ctl00_ContentPlaceHolder1_ddlSeattype').value = 'ALL';
        """)
        print("✅ Seat Type set to ALL")
        time.sleep(2)

        driver.execute_script("""
        document.getElementById('ctl00_ContentPlaceHolder1_btnSubmit').click();
        """)
        print("✅ Submit button clicked")
        time.sleep(5)

        rows = driver.find_elements(By.XPATH, "//table//tr")
        print("Rows found:", len(rows))

        for row in rows[1:]:
            cols = [c.text for c in row.find_elements(By.TAG_NAME, "td")]
            if cols:
                all_data.append([r] + cols)
            print(f"Processed row: {cols}")
        print(f"✅ Done Round {r}")

        # Debugging: Log all <select> elements on the page
        all_selects = driver.find_elements(By.TAG_NAME, "select")
        print("Logging all <select> elements on the page:")
        for select in all_selects:
            print(f"ID: {select.get_attribute('id')}, Name: {select.get_attribute('name')}, Visible: {select.is_displayed()}")

    except TimeoutException:
        print(f"❌ TimeoutException: Dropdown not clickable or present for round {r}")
        continue

    except NoSuchElementException as e:
        print(f"❌ NoSuchElementException: {e}")
        continue

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        continue

   

driver.quit()

df = pd.DataFrame(all_data, columns=[
    "Round",
    "Institute",
    "Program",
    "Quota",
    "Seat Type",
    "Gender",
    "Opening Rank",
    "Closing Rank"
])
df.to_csv("../data/josaa_full.csv", index=False)

print("🔥 FULL DATASET READY")