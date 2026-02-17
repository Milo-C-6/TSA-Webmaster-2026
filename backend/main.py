import asyncio
import websockets
import os
import time
import json
import sqlite3
import bcrypt
'''
TODO: integrate bcrypt or some other password thingamajig
'''
# Create a resource
async def createResource(data, ws):
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()

    id = cur.execute("SELECT id FROM resources ORDER by id DESC").fetchone()
    if id == None:
        id = (-1,)

    inputData = (int(id[0])+1, data["title"], data["password"], data["summary"], data["color"], data["location"], data["type"])

    cur.execute("INSERT INTO resources VALUES(?, ?, ?, ?, ?, ?, ?)", inputData)
    con.commit()
    con.close()
    await ws.send("1") # success

# Create an event
async def createEvent(data, ws):
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()

    id = cur.execute("SELECT id FROM events ORDER by id DESC").fetchone()
    if id == None:
        id = (-1,)

    inputData = (int(id[0])+1, data["title"], data["password"], data["color"], data["location"], data["startTime"])

    cur.execute("INSERT INTO events VALUES(?, ?, ?, ?, ?, ?)", inputData)
    con.commit()
    con.close()
    await ws.send("1") # success

async def getEvents(ws):
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    data = cur.execute("SELECT id, title, description, color, location, start FROM resources").fetchall() 
    # now thinking about it maybe passwords shouldnt be there mayhaps?
    await ws.send(json.dumps(data))

async def getResources(ws):
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    data = cur.execute("SELECT id, title, description, color, location, type FROM resources").fetchall()
    await ws.send(json.dumps(data))

async def serveResponse(websocket):
    async for message in websocket:
        msgData = json.loads(message)
        request = msgData["request"].split("_")
        if (msgData["request"] == "get_resources"):
            await getResources(websocket)
        if (msgData["request"] == "get_events"):
            await getEvents(websocket)
        if (request[0] == "create"):
            if request[1] == "event":
                await createEvent(msgData, websocket)
            elif request[1] == "resource":
                await createResource(msgData, websocket)
        if (request[0] == "edit"):
            pass

async def main():
    async with websockets.serve(serveResponse, "0.0.0.0", 8764):
        await asyncio.Future()  # run forever

asyncio.run(main())