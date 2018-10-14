# Reminiscent
## Inspiration
We are graduating from JC this year (wow we're graduating in 1 month and 3 days) and we want a way to remember and share the memories that we created together in our school life. So we created this social network app that automatically collates photos taken by people in our clique and preserves them in memories. Grouped in cliques, users are able to easily look back on the memories that they shared with their friends. The key technology in our project is the algorithm that automatically groups photos together with no input from the users required. The app then stores the photos in the cloud, preserving the memories forever.

## What it does
When a clique goes out and takes a bunch of photos, the algorithm we wrote uses the available date-time and location metadata, along with facial recognition, to group these photos together and make them accessible to the whole clique.

A memory — a group of photos taken at the same event and with the same clique — are then created from these groupings.

**We designed the algorithm such that users do not have to do a single thing between the uploading of photos and viewing of the memory.** This ease of use lets the user focus on the main function of the app. The main page consists of two feeds, one of memories recently created by the user's friends, another of the user's past memories, to let them reminisce.

## How we built it
### Algorithm
The algorithm first groups photos based on their proximity in date-time and location. We then apply facial recognition to determine the clique the photos belong to, grouping it together with the clique's photos from the same memory.

### Technologies
We use our own algorithm to group the photos, outsourcing facial recognition to Microsoft Azure. The webapp is served using Vue.js, communicating with a separate Node.js backend server that processes the images. Data is stored with PostgreSQL and files with Minio. 

## Challenges we ran into
Coming up with the grouping algorithm was difficult due to the limited metadata each photo has.

We spent a lot of effort to design our database structure as well as to optimize our SQL queries.

## Accomplishments that we're proud of
Planning and creating this algorithm from scratch! It took a lot of drawing, two whiteboards and many more flowcharts but we managed to do it. We also created a way of separating photos based on date and time with a statistical approach, which we're quite proud of.

## What we learned
The magic of nested SQL queries. 

## What's next for Reminiscent
We planned out how the entire social network works, but we only made the proof-of-concept with the essential novel features. To become a full-fledged social network app, mobile apps need to developed, with sharing, liking, commenting and discovery features.
