# ShoveboxList

## History
The shoveboxlist is a hierarchical list widget  that combines the table and the tree widgets. 
It was published by Mark Libbrecht in the April 2001 edition of Foxtalk Magazine, entitled "You Can Push it Around in Your...ShoveBoxList".<br>
<br>
An exemple of the 2001 shoveboxlist is depicted below <br><br>
<img src="images/Figure1.jpeg" alt="ShoveBoxList widget" width="300"/><br><br>
For the record: the 'aha' moment for creating the shoveboxlist came up when playing the 'stay alive' board game  ( from Milton Bradley - 1971):  <br><br>
<img src="images/stay_alive.jpg" alt="drawing" width="300"/><br><br>

# Behaviour and Characteristics

## General Overview

<br><br>
An example of the current appearance of the widget is shown in the screenshot below. This demonstration formset represents a fictious quote for a kitchen. 
The widget itself uses only HTML, CSS and plain vanilla javascript. Html rendering and data persitantence, in this demo to a SQLite database, is done through a django app  ( django-listbox).  
<br><br>
<img src="images/Shoveboxlist.jpg" alt="drawing" width="1215"/><br><br>

## Scrolling

<br><br> For vertical scrolling a traditional vertical scrollbar ('elevator' ) is available.   
<br><br>
<img src="images/vertical.jpg" alt="drawing" width="100"/><br><br>
<br><br>

## Record types and their representation

<br><br> Aside from the actual data, reports are typically broken down into different sections with corresponding headers to enhance human readibility. In order to treat section headers as well as other explanatory texts and comments in the same data tables and lists as the actual data and represent them , a tri-state button is available to determine the type of the record. .   
<br><br>


<img src="images/tri-state.jpg" alt="drawing" width="200"/><br><br>
<br><br>

## Context menu 

<img src="images/operations.jpg" alt="drawing" width="750"/><br><br>
<br><br>


## Ordering, Drag and drop

<img src="images/dragdrop.png" alt="drawing" width="750"/><br><br>
<br><br>


## Shrinkable field

### Reason for a shrinkable field 

No horizontal scrolling 

### Different list width examples

<img src="images/wide.jpg" alt="drawing" width="1215"/><br><br>
<br><br>
<img src="images/narrow.jpg" alt="drawing" width="1020"/><br><br>
<br><br>

### Tooltip for shrinkable field
<img src="images/ultra_narrow.jpg" alt="drawing" width="920"/><br><br>
<br><br>

### Popup editing window of a record

<img src="images/zoomin.jpg" alt="drawing" width="920"/><br><br>
<br><br>

<img src="images/zoomin_mozilla.jpg" alt="drawing" width="920"/><br><br>
<br><br>

## Levels concept

<img src="images/levels.jpg" alt="drawing" width="246"/><br><br>
<br><br>

## Changing Levels, 'Shoving'

<br>
<img src="images/horizontal.jpg" alt="drawing" width="200"/><br><br>


## Automatic numbering


<img src="images/niveaus1.jpg" alt="drawing" width="305"/><img src="images/niveaus2.jpg" alt="drawing" width="305"/><img src="images/niveaus3.jpg" alt="drawing" width="305"/>
<br><br>