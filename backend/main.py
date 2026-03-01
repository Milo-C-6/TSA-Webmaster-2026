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
    # check type set specific fields
    if type == "events":
        specificFields = "start"
    elif type == "resources":
        specificFields = "type"
    else:
        print(type)
        await ws.send("0")
        return
        
    con = sqlite3.connect("tsa2026_pending.db")
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

async def getEntires(ws, type : str, pending, inputPass):
    # check type set specific fields
    if type == "events":
        specificFields = ", start"
    elif type == "resources":
        specificFields = ", type"
    else:
        await ws.send("0")
        return
    if pending:
        if bcrypt.checkpw(bytes(inputPass, encoding='utf8'), ADMINPASS):
            con = sqlite3.connect("tsa2026_pending.db")
        else:
            await ws.send("0")
            return
    else:
        con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    data = cur.execute(f"SELECT id, title, description, color, location{specificFields} FROM {type}").fetchall() 
    con.close()
    # now thinking about it maybe passwords shouldnt be in that database mayhaps?
    await ws.send(json.dumps(data))

async def editEntry(data, ws, type):
    # check type set specific fields
    if type == "events":
        specificFields = "start"
    elif type == "resources":
        specificFields = "type"
    else:
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

# Accept entries, admin only
async def acceptEntry(data, ws, type):
    # check injection or wrong password
    if (type != "events" and type != "resources") or (not bcrypt.checkpw(bytes(data["password"], encoding='utf8'), ADMINPASS)):
        await ws.send("0")
        return
    
    conPending = sqlite3.connect("tsa2026_pending.db")
    curPending = conPending.cursor()
    pendingData = curPending.execute(f"SELECT * FROM {type} WHERE id = ?", (int(data["id"]),)).fetchall()
    curPending.execute(f"DELETE FROM {type} WHERE id = ?", (int(data["id"]),))
    conPending.commit()
    conPending.close()

    conPublic = sqlite3.connect("tsa2026.db")
    curPublic = conPublic.cursor()

    # get the highest id
    id = curPublic.execute(f"SELECT id FROM {type} ORDER by id DESC").fetchone()
    if id == None:
        id = (-1,)

    inputData = (int(id[0])+1, pendingData[0][1],pendingData[0][2],pendingData[0][3],pendingData[0][4],pendingData[0][5],pendingData[0][6])
    curPublic.execute(f"INSERT INTO {type} VALUES(?, ?, ?, ?, ?, ?, ?)", inputData)
    conPublic.commit()
    conPublic.close()



    await ws.send("1")

# deny entries, admin only
async def denyEntry(data, ws, type):
    # check injection or wrong password
    if (type != "events" and type != "resources") or (not bcrypt.checkpw(bytes(data["password"], encoding='utf8'), ADMINPASS)):
        await ws.send("0")
        return
    
    con = sqlite3.connect("tsa2026_pending.db")
    cur = con.cursor()
    cur.execute(f"DELETE FROM {type} WHERE id = ?", (int(data["id"]),))
    con.commit()
    con.close()

    await ws.send("1")

# Remove entries, admin only
async def removeEntry(data, ws, type):
    # check injection or wrong password
    if (type != "events" and type != "resources") or (not bcrypt.checkpw(bytes(data["password"], encoding='utf8'), ADMINPASS)):
        await ws.send("0")
        return
    
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    cur.execute(f"DELETE FROM {type} WHERE id = ?", (int(data["id"]),))
    con.commit()
    con.close()

    await ws.send("1")

async def serveResponse(websocket):
    async for message in websocket:
        msgData = json.loads(message)
        request = msgData["request"].split("_")
        match request[0]:
            case "get":
                await getEntires(websocket, request[1], msgData.get("pending"), msgData.get("password"))
            case "create":
                await createEntry(msgData, websocket, request[1])
            case "edit":
                await editEntry(msgData, websocket, request[1])
            case "accept":
                await acceptEntry(msgData, websocket, request[1])
            case "deny":
                await denyEntry(msgData, websocket, request[1])
            case "remove":
                await removeEntry(msgData, websocket, request[1])
            case _:
                await websocket.send("0")

async def main():
    async with websockets.serve(serveResponse, "0.0.0.0", 8764):
        await asyncio.Future()  # run forever

# will def be changed in the actual server
ADMINPASS = bcrypt.hashpw(b"securePassword", bcrypt.gensalt(14))

asyncio.run(main())