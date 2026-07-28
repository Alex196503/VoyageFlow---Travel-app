# Tourism application
Info:


## Database schema
Our relational database(made in SQL) follows a relational structure to manage bookings, scheduling, countries, users, ticketing and reviews. The following ERD diagram was designed in Lucidchart to map out the database arhitecture, relationships, and core functionalities before writing any SQL code or setting up the database.
> [!NOTE]
>  All main entities like users, bookings, tours, payments, reviews, etc, will include timestamp fields like **created_at** and **updated_at**, so we can keep track
> of the last tours made, when was the reservation booked, when was the payment processed, having a **TIMESTAMP** data type, to track time accurately across our time
> zone. These attributes were omitted from the initial ERD diagram to maintain visual clarity.
