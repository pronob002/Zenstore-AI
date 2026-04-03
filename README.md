# 🚀 ZenStore AI

ZenStore AI is a full-stack, AI-powered product catalog management system. It allows users to securely manage their products, utilizes Large Language Models (LLMs) to automatically generate professional marketing descriptions, and processes heavy bulk CSV uploads in the background.

## ✨ Core Features
- **Secure Authentication:** JWT-based authentication ensuring user data isolation.
- **RESTful API:** Robust endpoints for single product addition, batch CSV uploads, and product listing.
- **AI Integration:** Leverages the Groq API to instantly generate catchy, 2-sentence marketing descriptions and categorize products.
- **Asynchronous Processing:** Utilizes Celery and Redis to handle LLM calls without blocking the main API thread.
- **Real-Time Dashboard:** A React.js (Vite) + Tailwind CSS frontend featuring a live terminal that streams Redis background worker logs directly to the UI.
- **API Documentation:** Auto-generated Swagger UI.

---
## 🎥 Project Demonstration
Watch a full walkthrough of the application, including the real-time background AI processing and UI, here:  
👉 **[Watch the Live Demo on YouTube](https://youtu.be/Igkvyp_BQxQ)**

## 🛠️ Technical Constraints Addressed (Challenge Requirements)
1. **Object-Oriented Programming (OOP):** Core business logic is encapsulated in the `ProductService` class (`services.py`).
2. **Custom Decorator:** Implemented `@time_it` (`utils.py`) to calculate execution time and push logs to Redis.
3. **Python Generators:** Implemented `csv_row_generator` (`main.py`) to yield one row at a time from CSVs, ensuring memory efficiency.
4. **Caching Layer:** Redis caches user product lists and is invalidated upon new AI processing.

---

## 🚀 Setup & Installation Instructions

### Prerequisites
1. **Python 3.10+** (Added to your system PATH)
2. **Node.js & npm:** Download and install from [nodejs.org](https://nodejs.org/). 
3. **Redis Server:** Must be running locally on port `6379`.
   - **Windows Users:** Download Redis from [this direct link](https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip). Extract the `.zip` and double-click `redis-server.exe` to start the local cache.
   - **Mac/Linux Users:** Install via Homebrew (`brew install redis` -> `brew services start redis`).

---

### 1. Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd zenstore-ai
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   - Copy the `.env.example` file and rename it to `.env`.
   - Open `.env` and paste your actual **Groq API Key**.

5. **Start the Celery Worker:**
   Open a new terminal, activate the virtual environment, and run:
   ```bash
   # Windows users MUST use --pool=solo
   celery -A worker.celery_app worker --loglevel=info --pool=solo
   
   # Mac/Linux users
   celery -A worker.celery_app worker --loglevel=info
   ```

6. **Start the FastAPI Server:**
   Open another terminal, activate the virtual environment, and run:
   ```bash
   uvicorn main:app --reload
   ```
   *Swagger UI is available at `http://localhost:8000/docs`*

---

### 2. Frontend Setup

Open a new terminal and follow these exact commands to build the React application:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install base dependencies:**
   ```bash
   npm install
   ```

3. **Install core UI/Routing packages:**
   ```bash
   npm install axios react-router-dom lucide-react
   ```

4. **Install Tailwind CSS and its peer dependencies:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The frontend is now running at `http://localhost:5173`*

---
---

## 🔐 Environment Variables (.env.example)

To run the project locally, create a file named `.env` in the root directory of the project and copy the following variables into it. Replace the `GROQ_API_KEY` placeholder with your actual API key.

```env
DATABASE_URL=sqlite:///./zenstore.db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your_groq_api_key_here

## 🛑 Troubleshooting & Development Notes

If you encounter issues with Tailwind CSS not applying styles (i.e., the UI looks unstyled), it is usually due to Vite caching old configuration paths. 

**To fix a "styleless" UI, run these commands inside the `frontend` folder:**

1. Ensure the Tailwind configuration files are fully initialized:
   ```bash
   npx tailwindcss init -p
   ```

2. **Force Vite to clear its cache and rebuild the CSS engine:**
   ```bash
   npm run dev -- --force
   ```

3. Perform a **Hard Refresh** in your browser to clear the local CSS cache:
   - Windows: `Ctrl + Shift + R` (or `Ctrl + F5`)
   - Mac: `Cmd + Shift + R`
