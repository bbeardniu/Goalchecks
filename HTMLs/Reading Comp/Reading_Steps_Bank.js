(() => {
  'use strict';
  // Original classroom passages. Each produces one item per skill; choices are
  // fixed here, then shuffled with their answer keys by the assessment page.
  const stories = window.BeardReadingStories || [];
  const titles = [
    'Starting a Bean Plant','Returning a Library Book','Finding a Missing Mitten','Preparing a Bird Feeder','Washing a Muddy Dog',
    'Repairing a Flat Tire','Making Muffins','Preparing for a Rainy Walk','Visiting a Fossil Museum','Practicing Soccer Skills',
    'Cleaning Up After Painting','Building a Snowman','Planting a Lettuce Bed','Missing the School Bus','Wrapping a Birthday Gift',
    'Cleaning a Lunchroom Spill','Setting Up a Tent','Making Lemonade for the Family','Getting Help for a Sick Cat','Finishing a Jigsaw Puzzle',
    'Cleaning Litter from a Beach','Caring for Growing Seedlings','Serving a Fruit-Stand Customer','Performing in a School Play','Getting Ready to Fish',
    'Cleaning a Rabbit Hutch','Making Carrot Soup','Learning to Swim','Learning to Jump Rope','Delivering Letters Carefully',
    'Cooking a Pancake','Watching a Nesting Bird','Comparing Ice in Sun and Shade','Helping Carry Groceries','Learning About Fire Equipment',
    'Using a Map on a Hike','Repairing a Book Page','Collecting Eggs Carefully','Building a Steady Block Tower','Taking a Train Trip',
    'Measuring Rainfall','Making a Paper Kite','Practicing a Difficult Tune','Shopping with a Meal List','Learning to Care for Teeth',
    'Keeping a Library Quiet','Preparing a Family Picnic','Planning a Chess Move','Sorting a Container for Recycling','Crossing a Street Safely',
    'Fixing a Loose Button','Taking a Turn at Bowling','Watching Fish at Feeding Time','Trimming Long Bangs','Winning a Running Race',
    'Finding Shoes That Fit','Getting a Clock Working Again','Following a Playground Clue Hunt','Making a Paper Lantern','Checking a Bike Helmet',
    'Shaping a Clay Bowl','Learning to Catch a Ball','Preparing Dried Apple Snacks','Securing a Goat Pen','Making a Glowing Pumpkin',
    'Making Room on a Toy Shelf','Washing the Family Car','Finding a Woodpecker by Its Sound','Learning to Roller Skate','Sorting Clean Laundry',
    'Sharing News of an Award','Interviewing a School Custodian','Planning for a School Concert','Choosing a Safe Place for a Kite','Hiding an Acorn for Later',
    'Making a Hamster Tunnel Path','Comparing Bubble Wands','Performing with Paper-Bag Puppets','Building a Book Shelf','Baking a Loaf of Bread',
    'Organizing a Rock Collection','Observing Tiny Stream Creatures','Following Rabbit Tracks','Finding an Accessible School Entrance','Making a Garden Sign',
    'Practicing Basketball Shots','Cleaning Fish-Tank Glass','Making a Patterned Bracelet','Building a Blanket Reading Fort','Organizing Donated Food',
    'Making a Leaf Rubbing','Welcoming a New Classmate','Repairing a Toy Car','Displaying a Class Poster','Following a Turtle Care Chart',
    'Drawing a Scene from a Story','Moving a Concert Out of the Rain','Buying an Ice Cream Treat','Preparing Work for an Art Show','Making a Family Trip Scrapbook'
  ];
  // Foils stay within the story's setting. They are possible alternatives, but
  // the passage's evidence supports only the keyed answer.
  const inferenceFoils = [
    ['The pot to become dry enough to store','A new hole to appear in the pot','The window to be covered with soil'],
    ['He wanted to borrow a book before finding his old one','He needed to buy a new book bag','He planned to leave the book under the sofa'],
    ['She needed to hold a hot baking pan','She wanted to hide the boots from her friends','She planned to wash the mittens before going out'],
    ['He wanted to call the sparrow into his kitchen','He needed to stop the seeds from spilling','He wanted to warn the bird away from the dish'],
    ['The dog needed a haircut','The dog had spilled its drinking water','The dog was ready to go for a walk'],
    ['He wanted to leave the bicycle at school','His aunt had asked him to buy a new bike','He was following a walking trail on a map'],
    ['She had not put the muffins in the oven yet','She wanted the paper cups to get wet','She needed to mix more flour into the baked muffins'],
    ['He planned to stay inside all day','He thought the day would stay dry and sunny','He was preparing for a snowy mountain hike'],
    ['It was exactly as tall as the museum','It had visited the museum that morning','Its feet were smaller than her shoes'],
    ['He gives up on practice immediately','He blames someone and stops playing','He decides that passing does not need practice'],
    ['She painted the next class’s pictures for them','She made sure all of the paint stayed wet','She moved the next class to another room'],
    ['More snow was being added at its base','The yard was becoming colder than before','The snowman had just been moved indoors'],
    ['To give the rabbit a place to sleep in the lettuce','To keep rain from falling on the plants','To stop the soil from receiving sunlight'],
    ['He had already reached his classroom','He wanted to return the bus driver’s lunch','He had decided the bus stop was too noisy'],
    ['Whether the wrapping paper would change color','Whether the gift would fit in the mailbox','Whether the puzzle was too heavy for the chair'],
    ['He wanted them to bring more juice to spill','He needed them to leave their cups on the floor','He thought the dry floor needed to be washed'],
    ['It made the sleeping bags warmer by cooking them','It helped them see stars through the tent roof','It collected water inside the sleeping bags'],
    ['They needed something to water the garden with','They were planning to wash the porch with lemonade','They had asked him to save every cup for later'],
    ['She wanted to learn the cat’s favorite color','She needed help choosing a larger carrier','She wanted the vet to teach the cat a new trick'],
    ['He needed her to find every outside piece','He wanted her to put the picture back in its box','He could not tell whether the puzzle was finished'],
    ['It would give the gulls more plastic to eat','It would make the tide stop coming in','It would replace all the sand with clean stones'],
    ['Cooler air from inside the house','Water stored in the curtain','More space beneath the tray'],
    ['She wanted to give the customer the most damaged fruit','She was checking whether the bag matched her sign','She needed to count how many leaves were on the tree'],
    ['Certain that no audience would arrive','Bored because he had no lines to remember','Angry that the play had already ended'],
    ['She wanted to pack the line away immediately','She was lifting the empty pole out of the water','She was trying to loosen the hook from the pole'],
    ['He wanted the rabbit to find its own new bedding','He was getting the pen ready for a picnic','He planned to leave the hutch dirty'],
    ['Washing the outside of the carrots before cutting','Leaving the carrots on a cold counter','Pressing an empty spoon against the pot'],
    ['He wanted to leave the pool right away','He thought the lesson had been a punishment','He wanted to stop trying the new skill'],
    ['Putting the rope away before making any jumps','Waiting for someone else to do the jumping','Holding both handles without ever swinging the rope'],
    ['To find which house had the biggest garden','To decide which letters to keep for himself','To learn how many trees grew on the street'],
    ['The pancake needed to be put back in the batter','The pan needed to be washed before cooking','She wanted both sides to stay uncooked'],
    ['He wanted the bird to leave the nest for good','He needed to collect the twigs for himself','He was trying to move the nest to his yard'],
    ['The cube on the shaded plate','Both cubes were protected from warmth equally','Neither cube could melt on a plate'],
    ['She wanted Oliver to keep all of her groceries','She no longer needed any food at home','She had been looking for an empty shopping bag'],
    ['To carry drinking water in it','To make the fire engine go faster','To keep the hose from getting wet'],
    ['To count the buttons on his boots','To decide which snack to eat first','To see whether his water bottle was full'],
    ['She wanted the page to come loose again','She was trying to remove the tape before reading','She wanted to turn to the end without looking'],
    ['He wanted the basket to spill in the yard','He needed to make the eggs roll around','He wanted to use the eggs to mark the path'],
    ['They made the top of the tower heavier than the base','They left a wide gap beneath the tower','They kept the smaller blocks from touching'],
    ['The entire station was being carried down the track','The seat was still on the platform','Hugo had begun walking away from the station'],
    ['To mix yesterday’s rain with every future storm','To make the next water level look larger','To stop the gauge from ever collecting water again'],
    ['He needed still air to keep the string on the ground','He wanted rain to soften the paper first','He was waiting for the ribbon to become heavier'],
    ['Her music book had fewer notes the second time','She avoided the difficult part entirely','She played smoothly because she stopped practicing'],
    ['It told them which road had no traffic','It made the food cost nothing','It let them leave without checking any ingredients'],
    ['To teach Brooke how to clean the dentist’s chair','To show that brushing was needed only at the office','To help Brooke choose the color of the walls'],
    ['She was signaling that the room needed more talking','She could not find a place to sit','She wanted the books moved into the hallway'],
    ['It would keep all the sandwiches warm in direct sun','It would make the family walk farther before resting','It was the best place to leave food out overnight'],
    ['He wanted to move without noticing his queen','He was waiting for someone to put the pieces away','He needed to remember where he had left his coat'],
    ['To learn which flavor the yogurt had been','To decide whether food scraps should go inside the cup','To find the price of a new recycling bin'],
    ['To help the delivery truck park on the crossing','To make the group miss the school day','To cross before traffic had a chance to stop'],
    ['The button needed to be sewn on again immediately','The shirt could no longer be fastened','Grandma had removed every button from the shirt'],
    ['Disappointed that she had not tried bowling','Worried because she had lost the ball','Upset that none of the pins had fallen'],
    ['They were escaping through the closed lid','They were searching for a place with no water','They wanted the worker to move the whole tank'],
    ['Her hair had become long enough to cover her eyes','She no longer needed to sit in the salon chair','The mirror had been moved closer to her face'],
    ['Mateo had forgotten where to start','Mateo had decided not to run','Mateo had finished behind every other runner'],
    ['The first pair even though it pinched','Either pair because toe room did not matter','A smaller pair that squeezed more tightly'],
    ['Its hands had been removed from the face','It needed a larger place on the wall','It had no numbers left to show the time'],
    ['It gave the class every answer before they read clues','It told the children to ignore the playground','It showed the time that school would finish'],
    ['So the lantern would have a place to hold more glue','So she could fold the paper before cutting it','So she could hide every slit in the paper'],
    ['To make the helmet fall off before the ride','To check whether the bicycle tires were full','To loosen the straps after Mom tightened them'],
    ['To keep the clay wet enough to reshape all week','To let someone use it before it held its shape','To make room for a wet sponge in her hands'],
    ['He closed his eyes and stopped listening','He used a harder ball that was difficult to hold','He stopped bringing his hands toward the ball'],
    ['They had become whole apples again','They had taken in enough water to turn to juice','They were still soaking wet from being washed'],
    ['It had been carried over the fence by a visitor','It had been led into the farmhouse','It had opened a closed window in the barn'],
    ['The pumpkin skin had become see-through everywhere','The room lights were brighter than before','The marker lines were glowing without any light'],
    ['She had made the new game smaller','She had put all the donated toys back on the shelf','She had built a second shelf under the old one'],
    ['The doors had been painted a different color','The car had been moved into the shade','More dust had settled on the wet doors'],
    ['Her pencil moving across the notebook','A falling leaf landing on the ground','The binoculars brushing against her coat'],
    ['He wanted the wheels to stop turning forever','He was measuring the distance between the benches','He was trying to take off his skates while standing'],
    ['To see which person had the largest basket','To keep all the clothes on the table overnight','To mix the clean clothes with dirty laundry'],
    ['Annoyed that Nico had earned an award','Confused because Nico had said nothing about school','Uninterested and eager to end the call'],
    ['She wanted to change the custodian’s name for fun','She needed him to choose a name for the newspaper','She had not written any questions for him'],
    ['So they could shop at exactly the same time as the concert','So Felix would not need to look at the calendar','So the concert would have to be held another day'],
    ['To make the kite harder to see from the ground','To find something for the kite string to wrap around','To keep every breeze out of the field'],
    ['To make the oak tree stop growing','To keep other squirrels from ever finding food','To wash soil off the acorn before eating it'],
    ['To stop the hamster from entering the first tunnel','To block every tunnel opening at once','To teach the hamster to stay away from food'],
    ['Every large wand will always make the same-size bubble','The bubble mix changed color when he changed wands','Small wands can never make bubbles'],
    ['So her brother could not see the puppets at all','So she could stop telling the story halfway through','So her brother would watch only her face'],
    ['To find out how many pages were in each book','To make sure the boards would stay on the floor','To choose the color of his desk'],
    ['The unbaked dough needed a place to rise before mixing','The flour had to be spread on the rack first','They planned to eat the loaf straight from the hot oven'],
    ['She had lost one of the five rocks before washing them','She wanted to leave every rock outside the box','She needed a space for water from the washing'],
    ['The jar had become too heavy to lift','The rock needed to look larger in the drawing','The stream water was too warm to touch'],
    ['A deer standing far from the fence','A bird flying above the bushes','A dog that had not been near the tracks'],
    ['To find the fastest way to the playground swings','To avoid going to class that morning','To choose a place to leave the crutches outside'],
    ['So they could erase all the painted letters','So visitors would not read the sign yet','So the new plants would have time to grow tall'],
    ['He wanted to stop playing and leave the court','He had decided the hoop was too high to use','He needed to collect a ball outside the playground'],
    ['The fish had all moved to another tank','The tank had no water inside it','The food jar was covering the entire inside of the tank'],
    ['The cord would change the colors of the beads','Her uncle needed the beads scattered on the floor','The pattern did not matter once the bracelet was tied'],
    ['To keep anyone from putting pillows in the fort','To pull both chairs farther apart until the blanket fell','To make the reading light harder to turn on'],
    ['The volunteer no longer needed to check any labels','The volunteer had to mix the cans before packing','The volunteer could only pack one kind of food'],
    ['So the crayon could change the real leaf’s shape','So she would not need to look at her rubbing again','So the leaf could hide all of the lines on the paper'],
    ['She wanted Alex to spend recess alone','She wanted Alex to carry every backpack in the room','She wanted the new student to leave the class'],
    ['The wheel was still loose under the table','The car could no longer move across the floor','The car had one fewer wheel than before'],
    ['So the students would have to turn the poster over','So the poster’s message would stay hidden','So they could store the poster under a desk'],
    ['To show that the turtle should be fed again immediately','To record the day without feeding the turtle','To ask someone else to give the same meal again'],
    ['To change the story so it matched her drawing','To look for the book’s price before painting','To find a new character she had not drawn yet'],
    ['To keep the audience from hearing the music','To make room outside for another school band','To give the musicians a longer path to their seats'],
    ['He wanted the cup to be empty before Dad saw it','He was waiting for it to become a warm drink','He needed to save the ice cream until the next morning'],
    ['Embarrassed because she had never made a drawing','Angry that her family had come to see the art','Bored because none of her work was displayed'],
    ['They covered up the photos so no one could see them','They told the family which photos to throw away','They changed the order of the trip’s days']
  ];
  const literalFoils = {
    where:['Inside a kitchen cupboard','Under a bed','Beside the school gate','At the beach','In a classroom cubby','On a porch step','Behind a sofa','In a garage'],
    who:['A neighbor','A coach','A librarian','An uncle','A teacher','A shop worker','A cousin','A dentist'],
    what:['A folded blanket','A wooden spoon','A lunch box','A pair of gloves','A paintbrush','A notebook','A watering can','A basket of blocks'],
    when:['Before breakfast','On Monday morning','On Wednesday','After lunch','On Thursday evening','On Saturday night','Before school','On Sunday morning'],
    color:['Purple','Brown','Pink','Black','Gray','Red','Blue','Yellow','Orange','Green'],
    howmany:['One','Two','Three','Four','Five','Six','Eight','Ten','Twelve']
  };
  const normalize = value => value.toLowerCase().replace(/[.?!’']/g,'').replace(/\b(a|an|the|his|her|on|at|in)\b/g,'').replace(/\s+/g,' ').trim();
  const overlaps = (left,right) => normalize(left)===normalize(right)||normalize(left).includes(normalize(right))||normalize(right).includes(normalize(left));
  function literalChoices(story,index){
    const pool=literalFoils[story.l.kind]||literalFoils.what;
    const ordered=pool.slice(index%pool.length).concat(pool.slice(0,index%pool.length));
    return [story.l.a,...ordered.filter(value=>!overlaps(value,story.l.a)).slice(0,3)];
  }
  // Removing character names from the foils prevents a correct choice from
  // being revealed just because it is the only one naming this story's child.
  const names=new Set('Mina Owen Jade Luis Tessa Arun Rosa Malik Ella Theo Nina Felix Hana Diego Clara Mason Priya Evan Lena Noah Aisha Ben Sofia Isaac Grace Amir Julia Mateo Zoe Caleb Leila Darius Keira Oliver Lucy Ethan Ruby Finn Yara Hugo Sienna Adrian Camila Brooke Marcus Dalia Leon Maya Nico Liam Jules Noor Avery Daria Suki Cal Elena Wren Imani Zara Jalen Mei Amira Luz Anika Rafi Elsa Milo Dev Mara Eden Bo Kai Mae Rina Silas Leah Cora Alex Jada Gus Dani Yuna Iris Cole Arlo'.split(' '));
  function withoutNames(text){return text.replace(/\b[A-Z][a-z]+\b/g,word=>names.has(word)?'the child':word).replace(/^the child/,'The child');}
  function otherDetails(index){
    const selected=[];
    for(const offset of [19,43,71,7,31,59]){
      const text=withoutNames(stories[(index+offset)%stories.length].d);
      if(!selected.includes(text)&&!overlaps(text,withoutNames(stories[index].d)))selected.push(text);
      if(selected.length===3)break;
    }
    return selected;
  }
  if(stories.length!==100||titles.length!==100||inferenceFoils.length!==100)throw new Error('Reading Steps needs all 100 original stories and answer sets.');
  const bank=[];
  for(let index=0;index<stories.length;index++){
    const story=stories[index],position=index%4;
    bank.push({id:story.id+'-L',storyId:story.id,skill:'literal',p:story.p,q:story.l.q,o:literalChoices(story,index),a:0});
    bank.push({id:story.id+'-S',storyId:story.id,skill:'sequence',p:story.p,q:['Which of these actions happened first?','Which of these actions happened second?','Which of these actions happened third?','Which of these actions happened last?'][position],o:story.o.slice(),a:position});
    bank.push({id:story.id+'-M',storyId:story.id,skill:'mainidea',p:story.p,q:'Which title best fits the whole passage?',o:[titles[index],titles[(index+17)%100],titles[(index+39)%100],titles[(index+63)%100]],a:0});
    bank.push({id:story.id+'-D',storyId:story.id,skill:'details',p:story.p,q:'Which detail from the passage supports this idea: “'+titles[index]+'”?',o:[withoutNames(story.d),...otherDetails(index)],a:0});
    bank.push({id:story.id+'-I',storyId:story.id,skill:'inference',p:story.p,q:story.i.q,o:[story.i.a,...inferenceFoils[index]],a:0});
  }
  window.BeardReadingStepsBank=bank;
})();
