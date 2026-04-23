# Notification Feature Walkthrough

Successfully implemented the notification feature for Admin and Technician profiles.

## Backend Modifications
- **Notification Model**: Added a `type` field to [Notification.java](file:///c:/D/project1/mylab-backend/src/main/java/com/example/mylab/model/Notification.java) to allow categorizing different notifications (e.g., `COMPLAINT_REPORTED`).
- **Repository**: Added custom queries [countByUserAndReadFlagFalse](file:///c:/D/project1/mylab-backend/src/main/java/com/example/mylab/repository/NotificationRepository.java#13-14) and [findByUserAndReadFlagFalseOrderByCreatedAtDesc](file:///c:/D/project1/mylab-backend/src/main/java/com/example/mylab/repository/NotificationRepository.java#14-15) in [NotificationRepository](file:///c:/D/project1/mylab-backend/src/main/java/com/example/mylab/repository/NotificationRepository.java#10-16) for fetching unread counts and lists.
- **Service & Controller**: Implemented core logic and REST endpoints for:
  - `GET /api/notifications` (existing)
  - `GET /api/notifications/unread-count` (new)
  - `PUT /api/notifications/{id}/read` (new)
  - `PUT /api/notifications/read-all` (new)
- **Complaint Flow**: Modified [ComplaintService.java](file:///c:/D/project1/mylab-backend/src/main/java/com/example/mylab/service/ComplaintService.java) to automatically emit notifications to all users with `ADMIN` and `TECHNICIAN` roles whenever a new complaint is reported.

## Frontend Implementation
- **Dependencies**: Successfully ran `npm install` to resolve all missing dependencies (like `jspdf`, `recharts`, etc.) that were causing build failures.
- **Notification Service**: Created [notificationService.js](file:///c:/D/project1/mylab-frontend/src/services/notificationService.js) to modularize the API calls for notifications.
- **Notification Bell UI**: Implemented a responsive [NotificationBell.jsx](file:///c:/D/project1/mylab-frontend/src/components/NotificationBell.jsx) component leveraging `lucide-react` icons. 
  - Displays a red badge with the unread notification count.
  - Automatically polls the backend every 30 seconds for new notifications.
  - Includes a sleek, animated dropdown showing individual notifications with timestamps.
  - Provides "Mark as Read" functionality for individual items and a "Mark all read" global button.
- **Styling**: Engineered [NotificationBell.css](file:///c:/D/project1/mylab-frontend/src/components/NotificationBell.css) with a premium glassmorphism finish, dynamic hover states, pulse animations on the badge, and slide-in dropdown effects fully compatible with both light and dark modes.
- **Dashboard Integration**: Securely embedded the Notification Bell into the header of [Dashboard.jsx](file:///c:/D/project1/mylab-frontend/src/pages/Dashboard.jsx), ensuring it is only rendered for authenticated users with `ADMIN` or `TECHNICIAN` roles.

## Expected Behavior
When an issue is reported by any user, an entry is dynamically created.
The `ADMIN` and `TECHNICIAN` profiles will see their notification bell badge update automatically.
Clicking the notification marks it as read and subtracts from the unread badge count.

### Feature Demonstration Video
Here is a comprehensive recording showing the notification bell, adding a new PC to a lab, and generating all three system PDF reports:
![LabTrack Full Demo](C:/Users/MAYUR/.gemini/antigravity/brain/fcce7599-b11b-4ae1-859b-e914b7054f29/demo_add_pc_and_reports_1773460506484.webp)
