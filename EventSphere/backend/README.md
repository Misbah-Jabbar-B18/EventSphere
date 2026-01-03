## EventSphere Backend

### Setup
- Copy the following env keys into a new `.env` file in `backend/`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventsphere
JWT_SECRET=replace-with-long-random-string

# Email (SendGrid SMTP)
EMAIL_USER=apikey
EMAIL_PASS=SG.your-sendgrid-api-key
EMAIL_FROM=EventSphere <no-reply@eventsphere.local>
```

### Install & Run
```
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### API

- Auth
  - POST `/api/auth/register` { name, email, password, role? }
  - POST `/api/auth/login` { email, password }
  - GET `/api/auth/me` Bearer token

- Events
  - GET `/api/events` list public events
  - GET `/api/events/:id`
  - POST `/api/events` Bearer token (organizer/admin)
  - PUT `/api/events/:id` Bearer token (organizer/admin)
  - DELETE `/api/events/:id` Bearer token (organizer/admin)

- RSVPs
  - POST `/api/rsvps` { eventId, status? } Bearer token
  - GET `/api/rsvps/event/:eventId` Bearer token
  - DELETE `/api/rsvps/event/:eventId` Bearer token

### Notes
- Uses MongoDB via Mongoose; create a local DB named `eventsphere` or adjust `MONGO_URI`.
- CORS enabled for local development.

