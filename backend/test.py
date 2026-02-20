import sqlite3
import json
import bcrypt

'''
TODO: integrate bcrypt or some other password thingamajig
'''
def createSampleData():
    con = sqlite3.connect("tsa2026.db")

    cur = con.cursor()

    cur.execute("CREATE TABLE events(id, title, password, description, color, location, start)")
    cur.execute("CREATE TABLE resources(id, title, password, description, color, location, type)")

    events = (
        (0, "Art display", bcrypt.hashpw(bytes("apricot", encoding='utf8'), bcrypt.gensalt(14)), "see awesome fricken art", "blue", "level 2", "August 5th"),
        (1, "Film competition", bcrypt.hashpw(bytes("anvil", encoding='utf8'), bcrypt.gensalt(14)), "show off your cool indie films", "red", "level 3", "August 6th"),
        (2, "Gnosh's pizza opening", bcrypt.hashpw(bytes("pizzatastic", encoding='utf8'), bcrypt.gensalt(14)), "awesome evil pizza place is opening", "yellow", "level 4", "August 7th")
    )
    resources = [
        (0, "Universal Library", bcrypt.hashpw(bytes("rat", encoding='utf8'), bcrypt.gensalt(14)), "holy moly theres alot of history here", "green", "level 7", "library"),
        (1, "Universal Library 2", bcrypt.hashpw(bytes("egg", encoding='utf8'), bcrypt.gensalt(14)), "not enough history though, this has more", "lime", "level 23", "library"),
        (2, "Gnosh's pizza", bcrypt.hashpw(bytes("pizzatastic", encoding='utf8'), bcrypt.gensalt(14)), "awesome evil pizza place that is opened probably", "yellow", "level 4", "food")
    ]
    cur.executemany("INSERT INTO events VALUES(?, ?, ?, ?, ?, ?, ?)", events)
    cur.executemany("INSERT INTO resources VALUES(?, ?, ?, ?, ?, ?, ?)", resources)
    con.commit()
    con.close()

    con2 = sqlite3.connect("tsa2026_pending.db")

    cur2 = con2.cursor()
    cur2.execute("CREATE TABLE events(id, title, password, description, color, location, start)")
    cur2.execute("CREATE TABLE resources(id, title, password, description, color, location, type)")
    con2.commit()
    con2.close()

def testBcrypt():
    con = sqlite3.connect("tsa2026.db")
    cur = con.cursor()
    cur.execute("SELECT id, password FROM events")

    passw ="apricot"

    print(bcrypt.checkpw(bytes(passw, encoding='utf8'), cur.fetchone()[1]))
    con.close()

if __name__ == "__main__":
    createSampleData()
    # testBcrypt()