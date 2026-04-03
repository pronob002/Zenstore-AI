# 🚀 ZenStore AI

ZenStore AI is a full-stack, AI-powered product catalog management system. It allows users to securely manage their products, utilizes Large Language Models (LLMs) to automatically generate professional marketing descriptions, and processes heavy bulk CSV uploads in the background.

## ✨ Core Features
- **Secure Authentication:** JWT-based authentication ensuring user data isolation (users can only see their own products).
- **RESTful API:** Robust endpoints for single product addition, batch CSV uploads, and product listing.
- **AI Integration:** Leverages the Groq API to instantly generate catchy, 2-sentence marketing descriptions and categorize products.
- **Asynchronous Processing:** Utilizes Celery and Redis to handle LLM calls and simulate heavy "image processing" without blocking the main API thread.
- **Real-Time Dashboard:** A beautiful React.js (Vite) + Tailwind CSS frontend featuring a live terminal that streams Redis background worker logs directly to the UI.
- **API Documentation:** Auto-generated Swagger UI available out-of-the-box.

---

## 🛠️ Technical Constraints Addressed (Challenge Requirements)
This project strictly adheres to the requested technical constraints:
1. **Object-Oriented Programming (OOP):** Core business logic is encapsulated in the `ProductService` class (`services.py`).
2. **Custom Decorator:** Implemented a custom `@time_it` decorator (`utils.py`) that calculates execution time and pushes the logs to Redis for frontend display.
3. **Python Generators:** Implemented `csv_row_generator` (`main.py`) to yield one row at a time from batch CSV uploads, ensuring extreme memory efficiency during bulk processing.
4. **Caching Layer:** Redis is used to cache user product lists. The cache is automatically invalidated when new products are processed by the AI worker.

---

## ⚙️ Tech Stack
- **Backend:** FastAPI, Python 3, SQLAlchemy, SQLite
- **Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router, Lucide Icons
- **Background & Caching:** Celery, Redis
- **AI Provider:** Groq API

---

## 🚀 Setup & Installation Instructions

### Prerequisites
Before starting, ensure you have the following software installed on your machine:
1. **Python 3.10+** (Added to your system PATH)
2. **Node.js & npm:** Download and install from [nodejs.org](https://nodejs.org/). Installing Node.js automatically installs `npm` (Node Package Manager), which is required to run the frontend.
3. **Redis Server:** Must be running locally on port `6379`.
   - **Windows Users:** Download Redis from [this direct link](https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip). Extract the `.zip` folder and double-click `redis-server.exe` to start the local cache.
   - **Mac/Linux Users:** Install via Homebrew (`brew install redis` then `brew services start redis`) or apt.

---

### 1. Backend Setup

1. **Clone the repository:**
   
   git clone <your-repository-url>
   cd zenstore-ai
Create and activate a virtual environment:



# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
Install backend dependencies:



pip install -r requirements.txt
Environment Variables:

Copy the provided .env.example file and rename it to .env.
Open .env and paste your actual Groq API Key inside GROQ_API_KEY.
Start the Celery Worker:
Open a new terminal, activate the virtual environment, and run:



# Windows users MUST use --pool=solo
celery -A worker.celery_app worker --loglevel=info --pool=solo

# Mac/Linux users
celery -A worker.celery_app worker --loglevel=info
Start the FastAPI Server:
Open another terminal, activate the virtual environment, and run:



uvicorn main:app --reload
The API is now running at http://localhost:8000
Swagger UI Documentation is available at http://localhost:8000/docs

2. Frontend Setup
Open a new terminal and follow these exact commands to build the React application:

Navigate to the frontend directory:



cd frontend
Install base dependencies:



npm install
Install core UI/Routing packages:



npm install axios react-router-dom lucide-react
Install Tailwind CSS and its peer dependencies:



npm install -D tailwindcss postcss autoprefixer
Start the development server:



npm run dev
The frontend is now running at http://localhost:5173

🛑 Troubleshooting & Development Notes
During development or testing, if you encounter issues with Tailwind CSS not applying styles (i.e., the UI looks like plain, unstyled HTML), it is usually due to Vite aggressively caching old configuration paths.

To fix a "styleless" UI, run these commands inside the frontend folder:

Ensure the Tailwind configuration files are fully initialized:



npx tailwindcss init -p
Force Vite to clear its cache and rebuild the CSS engine:



npm run dev -- --force
Finally, perform a Hard Refresh in your browser to clear the browser's local CSS cache:

Windows: Ctrl + Shift + R (or Ctrl + F5)
Mac: Cmd + Shift + R
