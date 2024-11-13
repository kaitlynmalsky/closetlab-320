# Use an official Python runtime as a parent image
FROM python:3.12.4

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

RUN ls
COPY requirements.txt /app/requirements.txt
# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY entrypoint.sh /app/entrypoint.sh
# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose port 8001 for Gunicorn
EXPOSE 8000

# Set the entrypoint to the entrypoint script
CMD ["/app/entrypoint.sh"]