Admin Panel (For employment agency to use, for myself and internal team)


Things to be done
Progress
Deadline
1
New account creation by admin user for new user
WIP
20 Dec 2025
2
Page to capture overview data of registration via jobseeker (Hustle Hero) through mobile app , Verification, approval action by admin etc with identity card image upload
Completed
5 Dec 2025
3
Insert report generation (Service Report, Invoice, Sales Personnel Report)




4
Everything for incoming and outgoing payment




5
Job Management overview table page




6
Attendance QR code generation page and list for all employers and outlets.




7
Notification workflow




8
Server























Mobile App (For jobseeker/part time worker/freelancer/hustle hero)


Things to be done
Progress
Deadline
1
Singapore Twilio SMS integration for account registration and login page




2
Page to capture overview data of registration via jobseeker (Hustle Hero) through mobile app).




3
QR code for attendance scan in/out




4
Notification workflow




5
Google and apple app store






















Overall integration?
What is Attendance QR code and how to implement with proper logic

Payment system
Part time workers will login to their account via the mobile app to scan in/out for their shift with a physical QR code by only LIVE CAMERA in the work place for each outlet and also different companies with geofencing restriction to 50m radius based on outlet address.

When employers scan out with QR code, we need to create a textbox for them to input total break time in minutes manually. So we could know their total work hours for the shift completion. (Total worked hours = scan out time - scan in time - break time)

Floating QR code to be generated for each different employer and outlets via admin panel (an attendance QR code management page to manage attendance QR code like new QR code generation,details of employer with different QR code, printout etc) and ready to be printed for each new employer and new outlets.

Logic example: Company A and Company B
Company A using QR code A
Company B using QR code B

If company A has 10 outlets. QR code will be QR code A1, A2 to A10 (10 different code code tie to Company A with different outlet addresses

If company B has 20 outlets. QR code will be QR code B1, B2 to B20 (20 different code codes tied to Company B with different outlet addresses.

The shift details captured including total worked hours for the shift for the employee will be linked over to the payroll page.

Admin will be able to edit the time in/out/break time details and approve the shift completion. Admin can change the status to ready for payout. Then, salary credit will transfer to their mobile app wallet. Workers are able to activate the withdrawal in any total credits they key in which remain in their wallet anytime.


Once a worker clicks withdraw with a total amount of SGD. Then activate outgoing payment gateway automatically using paynow to transfer from company bank account to their personal bank account via paynow. (can be any vendors like stripe etc, pls help research and engage the cost details with vendors)





Many more link and relationship from attendance QR code (super important to retrieve worker shift time stamp for a foundation to everything else)


Example
The edited and approved shift details by capturing scanning in/out with attendance qr code by a worker will also link to many pages for example shift completion details page. From here will have a dashboard display linked to total worked hours, number of completed shifts, punctuality, no show etc in worker mobile app and our admin panel.

Many more relationships will tie to this input. Let's explain further in the next meeting.
































Worker Payment

This section needs to have a transaction record log based on worker shift completion. Once shift is completed an admin approves the shift details (editing actual break time, actual scan in/out time) of all completed jobs in the job management section. Then the shift will be automatically transferred to this section. Once action by the admin is “Approved” or status show paid, credit the amount to the worker app wallet accordingly. If the amount is -negative (penalty etc), then transfer back the credit from the app wallet to our corporate bank account accordingly) and show “Paid” once credited back to our corporate bank account. If pending means user app wallet insufficient credit to be deducted in their next shift for lesser salary payment.

Payment Field
ID (Transaction ID), Shift ID, profile pic (mouse hover over to enlarge profile pic), Full Name, NRIC, Mobile Number, Amount, Type (It could be Salary, Incentive, Referral, Penalty, Others), Date of Shift Completed, Date Time of this transaction record, Status (Paid, Pending, Rejected), Action (Approve, Reject (With reason), Remarks (Show why reject)

Click full name direct to the worker profile
Click Shift ID direct to the shift details (Completed job section for this specific shift)
Able to add transactions (“Add New”). Able to key in NRIC, Then Name NRIC, mobile number would be displayed. Admin also to select Amount, Type. If incentive then shift of date completed is blank.
Able to multiselect in each row.
Filter option (Select Date Time, Type, NRIC, mobile number, Name, Status)
Can hide column field

From here can generate daily payslip with completed shift details to every worker by email with pdf automatically once payment log approved. (Deemed Paid)




For worker credit withdrawal part

Need to show withdrawal transaction once any worker user triggers api from corporate bank account to withdraw money to their own bank account.

For field transactions please think. It's straightforward with some ideas like the worker payment part. A vital field is needed to show how much workers withdraw money. Also the transfer channel via paynow api (NRIC or mobile number) or to a user bank account. The payment option or channels need to be selected or filled in by the worker through the mobile app.



For client (invoice part)

Invoicing is pretty general too. Please go study how other people do it.

What I want specifically is to be able to have the function to email clients for bi weekly or monthly invoice. Also attached with a service report.

Sample as below.

Invoice is pdf template
https://drive.google.com/file/d/1rOM93S33EOFdivjbSIer3aHGIqQTSvIV/view?usp=drive_link

Service report would be excel and pdf. 
https://drive.google.com/file/d/17n7VDlxU-33uHoNdpzad5LvFLw78Wyb2/view?usp=drive_link



Side note
https://drive.google.com/file/d/1QeH61zDAS8zs2z2VymYswCbwYwm4tyKW/view?usp=drive_link

I need to have this type of timesheet/attendance sheet sent over to the client automatically by email 2 days (i could control the timeframe to be set) before the shift starts.

Once any worker is confirmed by the admin by their application through mobile app, the details will be consolidated and ported over to a document. (this report could be generated in the job management section under the shift details.

The actual attendance sheet also would be available after shift completion based on user time in/time out and after user confirm the actual ones in the job completion section.
