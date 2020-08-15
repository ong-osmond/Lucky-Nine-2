use eco_meetup;

insert into events (title, description, category, venue, dateTime, createdAt, updatedAt)
values ('Coogee Beach Cleanup', 'Coogee Beach Cleanup description goes here...', 'Cleanup', 'Coogee, WA', ('2020-08-19 12:00:00'), now(), now());
insert into events (title, description, category, venue, dateTime, createdAt, updatedAt)
values ('Whiteman Park Treeplanting', 'Whiteman Park Treeplanting description goes here...', 'Tree Planting', 'Whiteman Park, WA', ('2020-08-22 13:00:00'), now(), now());
insert into events (title, description, category, venue, dateTime, createdAt, updatedAt)
values ('Balcatta Recycling Drive', 'Balcatta Recycling Drive description goes here...', 'Recycling', 'Balcatta, WA', ('2020-08-22 13:00:00'), now(), now());

select * from events;