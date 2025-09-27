# Speaker Persona App - Vibeathon 2025

A comprehensive event management system designed for speakers and event managers to streamline session management, speaker engagement, and event coordination.

## 🚀 Features

### For Speakers
- **Session Management**: Submit, edit, and manage session proposals
- **Document Upload**: Share presentations and materials
- **Agenda Access**: View published event schedule
- **QR Code Generation**: Check-in and t-shirt collection
- **Real-time Notifications**: Email and in-app updates

### For Event Managers
- **Session Review**: Approve, reject, or hold submissions
- **Agenda Builder**: Dynamic agenda creation and management
- **Speaker Communication**: Automated emails and notifications
- **Change Request Management**: Handle speaker modification requests
- **Feedback System**: Collect and analyze post-event feedback
- **Analytics Dashboard**: Comprehensive event insights

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion, React Router
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: JSON-based file system
- **Notifications**: Nodemailer for email automation
- **QR Codes**: QR code generation and scanning
- **UI Components**: Custom components with modern design

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iiscvibes-vibeathon
   ```

2. **Install all dependencies**
   ```bash
   npm run install
   ```

3. **Start the development servers**
   ```bash
   npm run dev # or npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Project Structure

```
iiscvibes-vibeathon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
├── server/                # Node.js backend
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication & validation
│   ├── utils/           # Backend utilities
│   └── data/            # JSON database files
└── docs/                # Documentation
```

## 🎯 Key Functionalities

### Authentication & Authorization
- Role-based access control (Speaker/Event Manager)
- JWT token-based authentication
- Secure password handling

### Session Management
- Dynamic session submission forms
- Real-time status updates
- Change request handling
- Deadline enforcement

### Agenda Builder
- Drag-and-drop interface
- Color-coded session status
- Dynamic time slot management
- Track assignment

### Communication System
- Template-based email system
- Automated reminders
- In-app notifications
- Speaker briefing coordination

### QR Code System
- Unique QR codes for each speaker
- Check-in tracking
- T-shirt collection management
- Scan-once security

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Aesthetics**: Clean, professional interface
- **Smooth Animations**: Framer Motion transitions
- **Accessibility**: WCAG compliant components
- **Dark/Light Mode**: Theme switching capability

## 📧 Email Templates

The system includes comprehensive email templates for:
- Registration confirmation
- Session acceptance/rejection
- Document upload reminders
- Event day instructions
- Post-event follow-ups

## 🔒 Security Features

- Data encryption for PII
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- Audit trail logging

## 📊 Analytics & Reporting

- Speaker engagement metrics
- Session popularity tracking
- Attendance analytics
- Feedback analysis
- Export capabilities

## 🚀 Deployment

The application is designed for easy deployment on various platforms:
- Local development setup
- Docker containerization ready
- Cloud platform compatible
- Environment-based configuration

## 👥 User Roles

### Speaker Dashboard
- Personal profile management
- Session submission portal
- Document upload center
- Agenda viewing
- Certificate downloads

### Event Manager Dashboard
- Comprehensive admin panel
- Session review interface
- Agenda builder tool
- Communication center
- Analytics dashboard

## 🎉 Demo Ready Features

All features are fully functional and demo-ready:
- Complete user workflows
- Sample data included
- Intuitive navigation
- Professional presentation mode

## Contributors
- [Anirudh Gupta](https://github.com/AnirudhG07)
- [Aditya Arsh](https://github.com/chocabloc)
- [Omkaar](https://github.com/ombucha)
- [Palak Raisinghani](https://github.com/Pal-R-S)

## 📝 License

MIT License - feel free to use and modify for your events!

---

Built with ❤️ for Vibeathon 2025
