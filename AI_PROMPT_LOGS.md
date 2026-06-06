# AI Prompts Development Log - Sessions Marketplace

---

### Prompt #1
```
go through the project and get the complete understanding of it
```

### Prompt #2
```
can you run the test script to check and verify the tests
```

### Prompt #3
```
Create a full-stack project structure for:

Frontend:
- Next.js latest with TypeScript
- Tailwind CSS
- Axios
- React Query

Backend:
- Django
- Django REST Framework
- django-cors-headers
- psycopg2

Database:
- PostgreSQL

Infrastructure:
- Docker Compose
- Nginx reverse proxy

Requirements:

1. Create folders:
   frontend/
   backend/
   nginx/

2. Configure Dockerfiles for frontend and backend.

3. Configure docker-compose.yml with:
   - frontend
   - backend
   - postgres
   - nginx

4. Configure environment variables using .env.

5. Configure nginx:
   /api -> backend
   / -> frontend

6. Verify:
   localhost returns Next.js page
   localhost/api/health returns Django health endpoint

Generate complete code.
```

### Prompt #4
```
while this docker thing get completed do we build the next stage?
just check tell me do not code anything
```

### Prompt #5
```
Implement database models for a Sessions Marketplace.

Use Django ORM.

Models:

User:
- email (unique)
- name
- avatar
- role (USER, CREATOR)

Session:
- title
- description
- price
- image
- creator (FK User)

Booking:
- user (FK User)
- session (FK Session)
- status
- booked_at

Requirements:

1. Create serializers.
2. Create migrations.
3. Register models in admin.
4. Create sample seed command.
5. Expose API endpoints:

GET /sessions
GET /sessions/:id

Return sample data.

Generate complete code.
```

### Prompt #6
```
Test Cases
Get all sessions
GET /api/sessions

Expected:

[
  {
    "id":1,
    "title":"Yoga Session"
  }
]

Session detail
GET /api/sessions/1

Expected:

{
  "id":1,
  "title":"Yoga Session"
}

this test cases working fine?
```

### Prompt #7
```
Implement JWT authentication.

Requirements:

Use:
- djangorestframework-simplejwt

Endpoints:

POST /auth/register
POST /auth/login
POST /auth/refresh

Return:
- access token
- refresh token

Protect private routes.

Create:
GET /profile

which returns authenticated user.

Generate serializers, views, urls, permissions.
```

### Prompt #8
```
Test Cases
Register
POST /auth/register

Expected:

{
  "access":"...",
  "refresh":"..."
}

Profile
GET /profile
Authorization: Bearer token

Expected:

{
  "email":"..."
}

these test cases passed? like not the exact output but a proper output for these
```

### Prompt #9
```
Implement Google OAuth login.

Backend:
- django-allauth
- dj-rest-auth

Flow:

1. Frontend gets Google access token.
2. Send token to backend.
3. Backend verifies token.
4. Create user if not exists.
5. Issue JWT access and refresh tokens.

Endpoints:

POST /auth/google

Response:
{
  access,
  refresh,
  user
}

Generate backend and frontend integration.
```

### Prompt #10
```
Test Cases
Login

Click Google login.

Expected:

User created
JWT returned
Stored in frontend

Verify:

GET /profile

works.

this passes?
```

### Prompt #11
```
Implement role-based authorization.

Roles:
USER
CREATOR

Rules:

USER:
- view sessions
- create bookings

CREATOR:
- create sessions
- update sessions
- delete sessions

Create custom DRF permissions.

Protect endpoints accordingly.
```

### Prompt #12
```
Test Cases

USER:

POST /sessions

Expected:

403 Forbidden

CREATOR:

POST /sessions

Expected:

201 Created

are these passing?
```

### Prompt #13
```
Test Cases
POST /sessions - Creates session.
PUT /sessions/1 - Updates.
DELETE /sessions/1 - Deletes.
```

### Prompt #14
```
Implement booking system.

Endpoints:

POST /bookings
GET /bookings/my
GET /creator/bookings

Rules:

1. User cannot book same session twice.
2. Creator cannot book own session.
3. Booking timestamp stored.
4. Return booking history.

Generate tests.
```

### Prompt #15
```
Test Cases

Book session:

POST /bookings

Expected:

{
  "success":true
}

Duplicate booking:

400
Already booked

verify them
```

### Prompt #16
```
there are errors in serializers.py, tests.py, views.py
```

### Prompt #17
```
go through the project and get the complete understanding of the project
```

### Prompt #18
```
Build responsive frontend using Next.js.

Pages:

/
Session Catalog

/session/[id]

/dashboard/user

/dashboard/creator

/profile

Requirements:

Tailwind
Responsive
Loading states
Error handling
JWT persistence
Protected routes

Use React Query.
```

### Prompt #19
```
run the frontend so that I can verify and also give the test checklist
```

### Prompt #20
```
Error loading sessions

Make sure the Django database container and services are fully operational.
```

### Prompt #21
```
the my profile is broken, it's showing

HTTP 401 Unauthorized
{
    "detail": "Authentication credentials were not provided."
}
```

### Prompt #22
```
the session detail page is returning 404
http://localhost/session/9

and is the book session accessible without login? the google oauth button is not showing
```

### Prompt #23
```
404 still on the session id page
```

### Prompt #24
```
what about the other sessions?
```

### Prompt #25
```
Implement dashboards.

User Dashboard:
- profile
- active bookings
- past bookings

Creator Dashboard:
- session statistics
- booking counts
- manage sessions

Use cards and tables.
```

### Prompt #26
```
Prepare production-ready docker setup.

Requirements:

1. Multi-stage frontend build
2. Gunicorn for Django
3. PostgreSQL persistence
4. Nginx reverse proxy
5. Health checks
6. Environment variables
7. docker-compose up --build works

Generate final setup.
```

### Prompt #27
```
Create README.md containing:

1. Architecture diagram
2. Setup steps
3. Docker commands
4. OAuth setup
5. API documentation
6. Demo flow
7. Screenshots section

Create .env.example
```

### Prompt #28
```
https://github.com/anurag5764/sessions

with proper gitignore
push to github
```

### Prompt #29
```
lets deploy this with vercel and render
```

### Prompt #30
```
render.yaml has an issue

databases[0].databaseName - reserved DB name
databases[0].user - not a valid DB user name

databases:
  - name: sessions-db
    databaseName: postgres
    user: postgres

fix the render.yaml
```

### Prompt #31
```
✅ docker compose up --build works
✅ Google OAuth works
✅ JWT works
✅ User role works
✅ Creator role works
✅ Session CRUD works
✅ Booking works
✅ User Dashboard works
✅ Creator Dashboard works
✅ README complete
✅ .env.example added

this checklist checked and what is the google auth dev override?
```