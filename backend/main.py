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

# Create an entry
async def createEntry(data, ws, type : str):
    if type == "events":
        specificFields = "start"
    elif type == "resources":
        specificFields = "type"
    else: # cant win with these injectors
        print(type)
        await ws.send("0")
        return
        
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()

    id = cur.execute(f"SELECT id FROM {type} ORDER by id DESC").fetchone()
    if id == None:
        id = (-1,)

    inputData = (int(id[0])+1, data["title"], bcrypt.hashpw(bytes(data["password"], encoding='utf8'), bcrypt.gensalt(14)), data["description"], data["color"], data["location"], data[specificFields])

    cur.execute(f"INSERT INTO {type} VALUES(?, ?, ?, ?, ?, ?, ?)", inputData)
    # right now both tables have the same number of fields, but if this isn't the case, then that could create issues in the future
    con.commit()
    con.close()
    await ws.send("1") # success

async def getEntires(ws, type : str):
    if type == "events":
        specificFields = ", start"
    elif type == "resources":
        specificFields = ", type" # this should probably be changed from type to soemthing else to not get confused with the resources/events type
    else: # get outa here sql injection-er
        await ws.send("0")
        return

    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    data = cur.execute(f"SELECT id, title, description, color, location{specificFields} FROM {type}").fetchall() 
    con.close()
    # now thinking about it maybe passwords shouldnt be there mayhaps?
    await ws.send(json.dumps(data))

async def editItem(data, ws, type):
    if type == "events":
        specificFields = "start"
    elif type == "resources":
        specificFields = "type"
    else: # injector blockingtastic!
        print(type)
        await ws.send("0")
        return

    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()

    hashedPass = cur.execute(f"SELECT password FROM {type} WHERE id = ?", (int(data["id"]),)).fetchone()[0]

    if bcrypt.checkpw(bytes(data["password"], encoding='utf8'), hashedPass):
        newData = (data["title"], data["description"], data["color"], data["location"], data[specificFields], int(data["id"]))
        cur.execute(f"UPDATE {type} SET title = ?, description = ?, color = ?, location = ?, {specificFields} = ? WHERE id = ?", newData)
        con.commit()
        await ws.send("1")
    else:
        await ws.send("2")
    con.close()

async def serveResponse(websocket):
    async for message in websocket:
        msgData = json.loads(message)
        request = msgData["request"].split("_")
        if (request[0] == "get"):
            await getEntires(websocket, request[1])
        elif (request[0] == "create"):
            await createEntry(msgData, websocket, request[1])
        elif (request[0] == "edit"):
            await editItem(msgData, websocket, request[1])
        else:
            await websocket.send("0")

async def main():
    async with websockets.serve(serveResponse, "0.0.0.0", 8764):
        await asyncio.Future()  # run forever

asyncio.run(main())