# Use Python 3.11 as the base image
FROM python:3.11-alpine

# Install dependencies needed for psycopg2 (including PostgreSQL development libraries)
RUN apk update && apk add --no-cache \
    postgresql-dev gcc python3-dev musl-dev

# Set the working directory in the container
WORKDIR /app

# Copy the project files into the container
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the necessary port for the Flask server
EXPOSE 5000

# Command to run the Flask server
CMD ["python", "main.py"]
