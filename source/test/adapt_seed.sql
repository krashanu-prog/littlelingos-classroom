insert into docs(path,data) values
 ('lessons/s2','{"courseId":"c1","order":2,"title":"Fruits","kind":"story","minutes":5,"vocab":"apple = a red fruit\nbanana = a long yellow fruit\nmango = a sweet summer fruit\ngrape = a small round fruit"}'),
 ('lessons/s3','{"courseId":"c1","order":3,"title":"Animals","kind":"story","minutes":5,"vocab":"cat = a pet that says meow\ndog = a pet that barks\ncow = gives us milk\nhen = lays eggs"}'),
 ('lessons/s4','{"courseId":"c1","order":4,"title":"Colours","kind":"game","minutes":5,"vocab":"red = colour of a tomato\nblue = colour of the sky"}'),
 ('lessons/s5','{"courseId":"c1","order":5,"title":"Shapes","kind":"game","minutes":5,"vocab":"circle = round shape\nsquare = four equal sides"}')
on conflict (path) do update set data=excluded.data;
update docs set data=data||'{"completed":{"s1":1792000000000,"s2":1792100000000,"s3":1792200000000}}'::jsonb where path='progress/00000000-0000-0000-0000-0000000000d1';
