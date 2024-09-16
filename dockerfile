# Base image with Python 3.11
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy the project files into the container
COPY . /app

# Install dependencies using pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose internal port 5000 and external port 80
EXPOSE 5000
EXPOSE 80

# Command to run the Flask application on port 5000 internally
CMD ["python", "main.py"]
