#!/usr/bin/env python3
"""
Script to automatically add PostgreSQL server to pgAdmin
"""
import requests
import json
import time
import sys

def setup_pgadmin():
    # pgAdmin configuration
    pgadmin_url = "http://localhost:5050"
    email = "admin@eyesante.com"
    password = "admin123"
    
    # Server configuration
    server_config = {
        "Name": "iSante PostgreSQL",
        "Group": "Servers",
        "Host": "postgres",
        "Port": 5432,
        "MaintenanceDB": "eyesante_db",
        "Username": "eyesante_admin",
        "Password": "eyesante_admin_password",
        "SSLMode": "prefer"
    }
    
    # Wait for pgAdmin to be ready
    print("Waiting for pgAdmin to be ready...")
    for i in range(30):
        try:
            response = requests.get(f"{pgadmin_url}/misc/ping", timeout=5)
            if response.status_code == 200:
                print("pgAdmin is ready!")
                break
        except:
            pass
        time.sleep(2)
        print(f"Attempt {i+1}/30...")
    else:
        print("pgAdmin is not responding. Please check if it's running.")
        return False
    
    # Login to pgAdmin
    print("Logging in to pgAdmin...")
    session = requests.Session()
    
    try:
        # Get login page to get CSRF token
        login_page = session.get(f"{pgadmin_url}/login")
        
        # Login
        login_data = {
            "email": email,
            "password": password
        }
        
        login_response = session.post(f"{pgadmin_url}/login", data=login_data)
        
        if login_response.status_code != 200:
            print("Failed to login to pgAdmin")
            return False
        
        print("Successfully logged in to pgAdmin")
        
        # Add server
        print("Adding PostgreSQL server...")
        
        # Get server groups
        groups_response = session.get(f"{pgadmin_url}/browser/server_group/nodes/")
        if groups_response.status_code != 200:
            print("Failed to get server groups")
            return False
        
        groups_data = groups_response.json()
        if not groups_data:
            print("No server groups found")
            return False
        
        # Use the first server group
        server_group_id = groups_data[0]['id']
        
        # Add server
        server_data = {
            "name": server_config["Name"],
            "group_id": server_group_id,
            "host": server_config["Host"],
            "port": server_config["Port"],
            "maintenance_db": server_config["MaintenanceDB"],
            "username": server_config["Username"],
            "password": server_config["Password"],
            "sslmode": server_config["SSLMode"]
        }
        
        add_server_response = session.post(
            f"{pgadmin_url}/browser/server/",
            data=server_data
        )
        
        if add_server_response.status_code == 200:
            print("Successfully added PostgreSQL server to pgAdmin!")
            return True
        else:
            print(f"Failed to add server. Status: {add_server_response.status_code}")
            print(f"Response: {add_server_response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = setup_pgadmin()
    sys.exit(0 if success else 1)
