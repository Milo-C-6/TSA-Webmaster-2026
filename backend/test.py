import sqlite3
import json
import bcrypt

'''
TODO: integrate bcrypt or some other password thingamajig
'''
def createSampleData(password):
    con = sqlite3.connect("tsa2026.db")

    cur = con.cursor()

    cur.execute("CREATE TABLE events(id, title, password, description, color, location, start)")
    cur.execute("CREATE TABLE resources(id, title, password, description, color, location, type)")

    events = (
        (0, "The Grand opening of the Newly re-erected JuneBerry College", password, "Ever since the gas-leak explosion that shut down the school, due to damage and dangerous pipelines, there has been lots of attention on the new unveiling of the finally finished JuneBerry College has brought lots of excitement to the local community as with it, it brings many scholarships and new courses for learning.", "yellow", "level 2", "August 5th"),
        (1, "Boruscant Library Hosts the Esports Grand Finals", password, "This year at the Boruscant Library, the Esports Grand Finals, with major competitors like Team Flyers, Team Fluid, and Team Tier 1. The main games to be played are Counter-Fighters, Vitally, Maelstrom, and other popular competitive games.", "red", "level 3", "August 6th")
    )
    resources = (
        (0, "Boruscant Library", password, "Welcome to one of the biggest libraries on the planet! Home to over 3,450,000 different books! Being popular for the vast amount of books and options as well for the clubs and events hosted here regularly, inviting more to come and be a part of the community.", "green", "level 7", "library"),
        (1, "Sea-Haven Public Library", password, "Centered around the theme of its surroundings, you will find that exploring the See-Haven Public Library is almost as fun as the books inside. Built with stations for audio books and quiet corners, you can read just about anywhere here!", "purple", "level 23", "library"),
        (2, "Borescope Museum", password, "Welcome to the Borescope Museum! This museum features the history of Robotics and Programming successes and failures. Come explore the intriguing stories of famous creators and Trial Blazers.", "blue", "level 4", "museum"),
        (3, "National Public Museum", password, "Centered around the creation of the planet's history, you will find the artifacts from across the decades an amazing sight to see. Here you can dwell in peace and respect to the hundreds of years worth of work to make what you call home.", "orange", "level 4", "museum"),
        (4, "Star Risers Restaurant", password, "A breakfast restaurant, the only place capable of getting you ready for the morning and the rest of your day. Home the unique Star flavored syrup to put atop your pancakes or waffles. Also has the unique coffee flavors such as the Blue galaxy flavor, and the vanilla flavor. This place is a must for any early risers visiting or living in Boruscant.", "yellow", "level 16", "food"),
        (5, "BoruBurgers", password, "The greatest burger place in all of Coruscant, let alone the entire galaxy! Home to incredible foods such as the Boruscant Slider, the Rachasta Burger, and plenty of unique drinks such as the Jaw Juice. Visit here to keep your bellies full on your wonderful experience living in Boruscant.", "red", "level 8", "food")
    )
    cur.executemany("INSERT INTO events VALUES(?, ?, ?, ?, ?, ?, ?)", events)
    cur.executemany("INSERT INTO resources VALUES(?, ?, ?, ?, ?, ?, ?)", resources)
    con.commit()
    con.close()

    con2 = sqlite3.connect("tsa2026_pending.db")

    cur2 = con2.cursor()
    cur2.execute("CREATE TABLE events(id, title, password, description, color, location, start)")
    cur2.execute("CREATE TABLE resources(id, title, password, description, color, location, type)")

    resourcesPending = (
        (0, "Boruscant Library 2", password, "The long awaited sequal to the grandest library ever! Home to over 3,450,000 and one different books! Being unpopular for the many duplicate books from the previous library, inviting less to come and leave the planet immediately.", "green", "level 67", "library")
    )
    cur2.execute("INSERT INTO resources VALUES(?, ?, ?, ?, ?, ?, ?)", resourcesPending)

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
    PASSWORD = bcrypt.hashpw(b"inSecurePassword", bcrypt.gensalt(14)) # will also def be changed in the actual server
    createSampleData(PASSWORD)
    # testBcrypt()