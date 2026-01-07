# WorkLah Project - Week Plan

**Project:** WorkLah Admin Panel & Mobile App  
**Duration:** 1 Week  
**Start Date:** January 2025  
**Tech Stack:**
- **Frontend:** React.js (TypeScript + Vite)
- **Backend:** Node.js/Express
- **Application:** Flutter (Dart)

---

## 🎯 Project Overview

This project consists of three main components:
1. **React.js Admin Panel** - Management dashboard for admins
2. **Node.js Backend API** - RESTful API serving both admin and mobile app
3. **Flutter Mobile App** - User-facing mobile application

---

## 📅 Daily Breakdown

### **Day 1: Documentation & Setup**
- [ ] Add three specified items to all .md files
- [ ] Review all documentation files
- [ ] Verify project structure
- [ ] Set up development environment
- [ ] Test local development setup

### **Day 2-3: Backend Development**
- [ ] Verify all 80+ API endpoints are implemented
- [ ] Test admin authentication endpoints
- [ ] Test employer management endpoints
- [ ] Test job management endpoints
- [ ] Test application management endpoints
- [ ] Test payment/wallet endpoints
- [ ] Test attendance endpoints
- [ ] Verify response format (success field, full image URLs)
- [ ] Verify role-based access control

### **Day 4: React Admin Panel Integration**
- [ ] Verify all frontend API calls match backend endpoints
- [ ] Test authentication flow
- [ ] Test dashboard functionality
- [ ] Test job CRUD operations
- [ ] Test employer CRUD operations
- [ ] Test application management
- [ ] Test payment processing
- [ ] Fix any integration issues

### **Day 5: Flutter App Integration**
- [ ] Verify Flutter app API base URL
- [ ] Test user authentication (OTP flow)
- [ ] Test job browsing and application
- [ ] Test wallet operations
- [ ] Test attendance/QR scanning
- [ ] Test notifications
- [ ] Fix any integration issues

### **Day 6: Testing & Bug Fixes**
- [ ] End-to-end testing
- [ ] Cross-platform testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security review

### **Day 7: Deployment & Final Checks**
- [ ] Backend deployment
- [ ] React admin panel deployment
- [ ] Flutter app build preparation
- [ ] Final testing
- [ ] Documentation finalization

---

## 🔑 Critical Areas to Focus On

### **1. Admin Workflow (CRITICAL)**
```
Admin Login → Create Employer → Create Job
```
- Backend must validate: `employerId` exists, `outletId` belongs to employer
- Frontend already enforces employer selection before job creation

### **2. Response Format (CRITICAL)**
All API responses MUST include:
```json
{
  "success": true/false,
  "data": {...}
}
```

### **3. Image URLs (CRITICAL)**
All image URLs must be full URLs:
```
https://worklah.onrender.com/uploads/image.jpg
```

### **4. Role-Based Access Control**
- Admin endpoints: Verify `role: "ADMIN"`
- User endpoints: Verify `role: "USER"`

---

## 📋 Priority Endpoints

### **Admin Panel (React.js)**
1. ✅ `POST /api/admin/login`
2. ✅ `GET /api/admin/me`
3. ✅ `GET /api/admin/dashboard/stats`
4. ✅ `GET /api/admin/employers` (must include outlets)
5. ✅ `POST /api/admin/employers`
6. ✅ `GET /api/admin/jobs`
7. ✅ `POST /api/admin/jobs` (must validate employerId & outletId)
8. ✅ `GET /api/admin/applications`
9. ✅ `POST /api/admin/applications/:id/approve`
10. ✅ `GET /api/admin/users`

### **Mobile App (Flutter)**
1. `POST /api/user/login` (OTP)
2. `POST /api/user/verify-otp`
3. `GET /api/jobs`
4. `POST /api/jobs/:jobId/apply`
5. `GET /api/user/wallet`
6. `POST /api/attendance/clock-in`
7. `POST /api/qr/scan`

---

## 🚀 Quick Start Commands

### **React Admin Panel**
```bash
npm install
npm run dev
```

### **Backend (Node.js)**
```bash
npm install
npm start
# or
node server.js
```

### **Flutter App**
```bash
flutter pub get
flutter run
```

---

## 📝 Notes

- All documentation files need three items added (specify what these are)
- Backend API documentation is in `BACKENDupdate.md`
- Project handover documentation is in `TITAN.md`
- React admin panel status is mostly complete per `TITAN.md`

---

## ✅ Success Criteria

- [ ] All 80+ backend endpoints working
- [ ] React admin panel fully functional
- [ ] Flutter app fully functional
- [ ] All documentation updated
- [ ] All tests passing
- [ ] Ready for deployment

---

**Last Updated:** January 2025  
**Status:** Planning Phase

