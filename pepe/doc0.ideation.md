# Ideation
Description: This file records my thought process throughout the development and completion of this assignment (started 05/21/2026 @ 8 PM CST)


1. Understand the task

        Take notes as we go on things I deem important
        
        Notes taken
        
        *User*
        - login
        - check balance
        - update personal details
        
        *Task*
        Simple Web App
        - API (backend)
        - UI (frontend)

        *Stack*
        - node.js
        - lowdb

        *Core directives*
        - core code is on js and node
        - freedom to use any npm library
        - max time of 3 evenings (start to end)

        *Requirements*
        * login (email, password)
            - ACCESS IFF VALID USER
                - "what is a valid user?"
                "I will define it as one with working credentials"
        * flow
            - login -> home (details/dash)
        * AUTHORIZED USER
            - canCheckAccountBalance
            - canUpdateSelf
                - what is an authorized user?
                "I will define it as itself"
            
    2. Stack
        2.1 Initially I thought about just installing whatever I needed locally, but realized that could turn into a mess for whoever tests my code/project

        Thus, I've decided to containerize the setup via Docker and Docker Compose so that we do not run into the proble `It works on my machine`

    3. Extra notes
        3.1 Need to familiar with lowdb (enough to achieve CRUD operations)
        3.2 Would likes:
            * Fully responsive UI 
                - definition: mobile friendly, maybe mobile first
                - unit test of api
                - functional ui tests





        