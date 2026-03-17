# Client Feedback – Native App Requirements

This file lists native (mobile) app changes derived from client feedback (see `clienfeeedback.md`). Backend and admin-panel requirements are in separate files.

---

## 1. Bugs & behaviour

### 1.1 Repeated duplication of job descriptions (JD)
- **Issue:** Many repeated duplications of JD when using the mobile app.
- **Required:** 
  - Ensure job list/sync UI does not render the same job or JD multiple times (deduplicate by job ID).
  - Avoid duplicate API calls or duplicate create requests that could lead to multiple identical jobs; if backend returns an existing job for idempotent create, show that single job once.

---

## 2. Registration & profile (Section 2)

Implement the following in the **registration** and **user profile** flows. Backend must support these (see `CLIENT_FEEDBACK_BACKEND_REQUIREMENTS.md`); native app must implement the UI and validation.

### 2.1 Registration fields

| Field                     | Input method | Required | Remarks |
|---------------------------|-------------|----------|---------|
| Full Name (As per NRIC)   | Textbox     | Required | |
| Mobile Number            | Textbox     | Required | **Login ID.** Show a remark under this field: “This is your login ID.” |
| Employment Status         | Dropdown    | Required | Options: **Singaporean/Permanent Resident**, **Long Term Pass Holder**, **Student Pass (Foreigner)**, **No Working Pass**. User selecting **No Working Pass** must **not** be able to proceed (disable “Register” or show validation error). |
| Email Address             | Textbox     | Required | |

### 2.2 Postal code → district (Singapore)
- **Logic:** First 2 digits of the 6-digit postal code denote postal sector and map to district (e.g. 69 8910 → Lim Chu Kang / Tengah, District 24).
- **Required:** 
  - When user enters a 6-digit postal code, call backend (or use local mapping) to get **district** and show or store it in the user profile.
  - Display district in profile/address section where relevant.

### 2.3 Date of birth and age
- **Required:** 
  - User enters **date of birth**.
  - App displays **age** (calculated from DOB) in the application user profile.
  - Respect minimum age rules (e.g. 13 for light duties; 16 for secondary school part-time; 17 for college part-time; 14 for foreign students with Student Pass). Show validation errors or eligibility messages when age is below the required minimum for the selected role/flow.

### 2.4 Colleges / higher institutions
- **Required:** For part-time work (17+), provide a list of **colleges and higher institutions** eligible in Singapore (from backend or static list). Use as dropdown or autocomplete in registration/profile where applicable.

### 2.5 Employment status – document upload and ID number
- **Document upload:** Depending on **employment status** selected at registration, show the correct **document upload** category (e.g. one document type for Singaporean/PR, one for Student Pass, one for Long Term Visit Pass).
- **ID number field (9 characters):**
  - **Singaporean/PR:** Label: **“NRIC No.”**
  - **Student Pass:** Label: **“Student Pass No.”**
  - **Long Term Visit Pass:** Label: **“Long Term Visit Pass No.”**
  - **Format (all three):** Exactly **9 characters**. First and last character **alphabetic only**. Positions 2–8 **numeric only**. Example: `G1060626N`.
- **Required:** 
  - Restrict input to 9 characters; validate format (1st & last alpha, 2–8 numeric) before submit.
  - Show clear error if format is wrong.
  - Send validated value to backend with the correct type (NRIC / Student Pass No. / LTVP No.) according to employment status.

---

## 3. Display consistency with backend

- **Age:** Display the age calculated from DOB (backend can also return it for admin/consistency).
- **District:** Display district derived from postal code where address/district is shown.
- **Employment status:** Show the selected employment status and the corresponding ID label (NRIC No. / Student Pass No. / Long Term Visit Pass No.) in profile.

---

## 4. Summary checklist (native app)

- [ ] Fix JD duplication in job list/sync (deduplicate by job ID; avoid duplicate creates).
- [ ] Registration: Full Name, Mobile (with “Login ID” remark), Employment Status, Email – all required.
- [ ] Block registration when “No Working Pass” is selected.
- [ ] 6-digit postal code → show/store district (first 2 digits → sector/district).
- [ ] Date of birth input; display calculated age in user profile.
- [ ] Colleges / higher institutions list (17+) for part-time eligibility where needed.
- [ ] Employment-status-specific document upload and ID field:
  - NRIC No. / Student Pass No. / Long Term Visit Pass No. (label per status).
  - 9 characters; 1st & last alpha, 2–8 numeric; validate and send to backend.
