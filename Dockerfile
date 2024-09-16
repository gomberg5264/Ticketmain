# Use Python 3.11 as the base image
FROM python:3.11-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the Python project files into the container
COPY . /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the necessary port for the Flask server
EXPOSE 5000

# Command to run the Flask server
CMD ["python", "main.py"]
