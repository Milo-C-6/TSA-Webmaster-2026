import sqlite3
import json
'''
TODO: integrate bcrypt or some other password thingamajig
'''
def createSampleData():
    con = sqlite3.connect("tsa2026.db")

    cur = con.cursor()
    cur.execute("CREATE TABLE events(id, title, password, description, color, location, start)")
    cur.execute("CREATE TABLE resources(id, title, password, description, color, location, type)")

    events = [
        (0, "Art display", "apricot", "see awesome fricken art", "blue", "level 2", "August 5th"),
        (1, "Film competition", "anvil", "show off your cool indie films", "red", "level 3", "August 6th"),
        (2, "Gnosh's pizza opening", "pizzatastic", "awesome evil pizza place is opening", "yellow", "level 4", "August 7th")
    ]
    resources = [
        (0, "Universal Library", "rat", "holy moly theres alot of history here", "green", "level 7", "library"),
        (1, "Universal Library 2", "egg", "not enough history though, this has more", "lime", "level 23", "library"),
        (2, "Gnosh's pizza", "pizzatastic", "awesome evil pizza place that is opened probably", "yellow", "level 4", "food")
    ]
    cur.executemany("INSERT INTO events VALUES(?, ?, ?, ?, ?, ?, ?)", events)
    cur.executemany("INSERT INTO resources VALUES(?, ?, ?, ?, ?, ?, ?)", resources)
    con.commit()
    con.close()

if __name__ == "__main__":
    createSampleData()