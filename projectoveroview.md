*** Admin Panel : React Js
***Backend : on Node 
*** User : FLutter 


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
