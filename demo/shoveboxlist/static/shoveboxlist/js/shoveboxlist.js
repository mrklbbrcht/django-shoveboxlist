// to do: enable use strict, test all functions and tweak
// "use strict";



// get formating information from css file
var shoveBoxStyle = getComputedStyle(document.body);

const backgrounColors = [shoveBoxStyle.getPropertyValue('--color0'), shoveBoxStyle.getPropertyValue('--color1'), shoveBoxStyle.getPropertyValue('--color2')];
const fontWeights = [shoveBoxStyle.getPropertyValue('--fontWeight0'), shoveBoxStyle.getPropertyValue('--fontWeight1'), shoveBoxStyle.getPropertyValue('--fontWeight2')];

// const gripheight = parseInt(bodystyle.getPropertyValue('--gripheight'));
const gripwidth = parseInt(shoveBoxStyle.getPropertyValue('--shoveboxheight'));
const gripradius = parseInt(shoveBoxStyle.getPropertyValue('--gripradius'));


var shoveBoxBorderWidth = parseInt(shoveBoxStyle.getPropertyValue('--shoveboxborder'));
var shoveBoxBorderColorDefault = shoveBoxStyle.getPropertyValue('--shoveboxbordercolordefault');
var shoveBoxBorderColorSelected = shoveBoxStyle.getPropertyValue('--shoveboxbordercolorselected');
var shoveBoxPlaceHolderHeight = shoveBoxStyle.getPropertyValue('--shoveboxplaceholderheight');
var shoveBoxPlaceHolderOverHeight = shoveBoxStyle.getPropertyValue('--shoveboxplaceholderoverheight');

var ctrlKeyDown = false;


class Operation {
  // Create new instances of the same class as static attributes
  static None = new Operation("None")
  static Copy = new Operation("Copy")
  static Cut = new Operation("Cut")
  static Paste = new Operation("Paste")


  constructor(name) {
    this.name = name
  }
};

function unselectShoveboxes(shoveBoxList) {

  for (const box of shoveBoxList.querySelectorAll('[shoveboxselected=true]')) {
    box.setAttribute('shoveboxselected', false);
  };
}


function markForDeletion(box) {
  box.querySelector('[name$="-DELETE"]').value = "";
}

// node.insertAfter() is not an inbuilt javascript method so we created a user-defined function.
function insertAfter(newNode, refNode) {
  return refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}


function moveShoveboxes(targetShoveBox) {
  afterShoveBox = targetShoveBox
  for (const box of targetShoveBox.parentNode.querySelectorAll('[shoveboxselected=true]')) {
    insertAfter(box, afterShoveBox);
    afterShoveBox = box;
    box.setAttribute('shoveboxselected', false);
  };
}


// https://stackoverflow.com/questions/61135510/add-row-dynamically-in-django-formset

// adds locally and dynamically a shovebox 
function addShoveBox(invokedfrom) {

  // create DocumentFragment from template that was generated by the django formset factory:
  // this 'empty' form (=shovebox) will several <div> elements and among others also the foreign key 
  const formFragment = templateForm.content.cloneNode(true);

  // replace the __prefix__ placeholders that django provided for the empty formset form by the
  // actual form index
  // for (let element of formFragment.children     ) {
  // don't care of the shoveboxplaceholders => only the actual shovebox
  for (let element of formFragment.querySelectorAll('[shovebox-id]')) {
    element.innerHTML = element.innerHTML.replace(
      /(?<=\w+-)(__prefix__|\d+)(?=-\w+)/g,
      nextShoveBoxIndex.toString());

    // add a custom attribute to simplify bookkeeping
    element.dataset.shoveBoxIndex = nextShoveBoxIndex.toString();


    // add a delete click handler 
    setDeleteHandler(element);

    // Note that ShoveBoxes coming from existing database records are only removed after checking "delete" 
    // and clicking "Submit." Newly added Shoveboxes (i.e. not submitted yet) are removed 
    // as soon as you check the "delete" dustbin.


    // move the fragment's children onto the DOM (the fragment is empty afterwards)
    var newFormFragment = invokedfrom.parentNode.appendChild(formFragment);
    // keep track of form indices
    extraFormIndices.push(nextShoveBoxIndex++);

    // return the empty shovebox: since the last child is a placeholder, get the before last
    return invokedfrom.parentNode.lastChild.previousElementSibling;

  }

}


// NOTE: only for (immediately) removing that were dynamically added after the last pull from the database
function removeShoveBox(event) {

  // remove all elements with form-index matching that of the delete-input
  const shoveBoxIndex = event.target.dataset.shoveBoxIndex;
  for (let element of getFormElements(shoveBoxIndex)) {
    element.remove();
  }
  // remove form index from array
  let indexIndex = extraFormIndices.indexOf(Number(shoveBoxIndex));
  if (indexIndex > -1) {
    extraFormIndices.splice(indexIndex, 1);
  }
}


function setDeleteHandler(containerElement) {
  // modify DELETE checkbox in containerElement, if the checkbox exists
  // (these checboxes are added by formset if can_delete)

  const inputDelete = containerElement.querySelector('input[id$="-DELETE"]');
  if (inputDelete) {
    // duplicate the form index instead of relying on parentElement (more robust)
    inputDelete.dataset.shoveBoxIndex = containerElement.dataset.shoveBoxIndex;
    inputDelete.onclick = removeShoveBox;
  }
}

function getFormElements(shoveBoxList, index) {
  // the data-shove-box-index attribute is available as dataset.shoveBoxIndex
  // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes#javascript_access
  return shoveBoxList.querySelectorAll('[data-shove-box-index="' + index + '"]');
}

function updateNameAttributes(shoveBoxID) {
  const shoveBoxList = document.getElementById(shoveBoxID);

  if (shoveBoxList) {
    // make sure the name indices are consecutive and smaller than
    // TOTAL_FORMS (the name attributes end up as dict keys on the server)
    // note we do not need to update the indices in the id attributes etc.
    for (let [consecutiveIndex, shoveBoxIndex] of extraFormIndices.entries()) {
      for (let formElement of getFormElements(shoveBoxList, shoveBoxIndex)) {
        for (let element of formElement.querySelectorAll('input, select')) {
          if ('name' in element) {
            element.name = element.name.replace(

              // ? => Match zero or 1 occurences of the previous item. That is, the previous item is optional
              // __prefix__|\d+   => match the text __prefix__   or a certain number of ASCI digits [0-9]
              //  \w+ a certain number of any ASCII word characters  
              // -  => the - character
              // g => perform a global match- that is find all matches rather than stopping after the first match

              /(?<=\w+-)(__prefix__|\d+)(?=-\w+)/g,
              (initialForms + consecutiveIndex).toString());
          }
        }
      }
    }

  }
  updateTotalFormCount(shoveBoxList);
}

function updateTotalFormCount(shoveBoxList) {
  // note we could simply do initialForms + extraFormIndices.length
  // to get the total form count, but that does not work if we have
  // validation errors on forms that were added dynamically
  const firstElement = templateForm.content.querySelector('input, select');
  // select the first input or select element, then count how many ids
  // with the same suffix occur in the formset container
  if (firstElement) {
    let suffix = firstElement.id.split('__prefix__')[1];
    let selector = firstElement.tagName.toLowerCase() + '[id$="' + suffix + '"]';
    let allElementsForId = shoveBoxList.querySelectorAll(selector);
    // update total form count
    inputTotalForms.value = allElementsForId.length;
  }
}
// }, false);

// first time initialization or refreshing (resizing) of shoveboxlist
function initShoveboxlist(shoveboxlist) {

  shoveboxlist.operation = Operation.None;

  var sbl_items = [
    { name: 'Cut', fn: function (target) { console.log('Cut', target); } },
    { name: 'Copy', fn: function (target) { console.log('Copy', target, target.id); } },
    { name: 'Paste', fn: function (target) { console.log('Paste', target); } },
    {},
    { name: 'Select All', fn: function (target) { console.log('Select All', target); } },
  ];

  // Contextmenu of type sbl_items to open by rightclicking when on the shoveboxlist 
  var cm1 = new ContextMenu('.shoveboxlist', sbl_items);


  var sb_items = [

    {
      name: 'Insert new record (after)', fn: function (target) {

        // Get ShoveBox the menuitem was invoked from
        const callingShoveBox = getCorrespondingShoveBoxNode(target);

        // add an empty form
        newShoveBoxElement = addShoveBox(target);

        // VERTICAL MOVE
        insertAfter(newShoveBoxElement, callingShoveBox);

        // HORIZONTAL MOVE: position the newly inserted shoveboxElement 
        move(newShoveBoxElement, newShoveBoxElement.getElementsByClassName("slider")[0])

        var activeButton = newShoveBoxElement.getElementsByClassName('typeswitch')[0].querySelectorAll("input[checked]")[0];
        var selectedButtonIndex = parseInt(activeButton.id.slice(-1));
        formatShovebox(newShoveBoxElement, selectedButtonIndex)

        // ReCall the function that determines the reference field value
        ContentFormating.autoref(newShoveBoxElement.parentNode);

        // set focus to the newly added shovebox
        unselectShoveboxes(shoveboxlist);
        newShoveBoxElement.setAttribute('shoveboxselected',true);


      }
    },

    // { name: 'Copy Content', fn: function (target) { console.log('Geklikt op element met id = ', target.id); } },
    {
      name: 'Copy Record(s)', fn: function (target) {

        shoveboxlist.operation = Operation.Copy;

      }
    },
    // { name: 'Cut Content', fn: function (target) { console.log('Geklikt op element met id = ', target.id); } },
    {
      name: 'Cut Record(s)', fn: function (target) {

        shoveboxlist.operation = Operation.Cut;

      }
    },

    {
      name: 'Paste Record(s)', fn: function (target) {

        // Get ShoveBox the menuitem was invoked from
        const callingShoveBox = getCorrespondingShoveBoxNode(target);

        switch (shoveboxlist.operation) {
          case Operation.None:
            break;

          case Operation.Copy:
            copiedShoveBoxes = [];
            afterThisBox = callingShoveBox;

            for (const box of callingShoveBox.parentNode.querySelectorAll('[shoveboxselected=true]')) {

              // copy shoveBox:
              const copiedBox = box.cloneNode(true);

              matchRegex = basePrefix + "-(\\d){1}-";

              let formRegex = RegExp(matchRegex, 'g'); //Regex to find all instances of the form number

              //Update the new form to have the correct form number

              copiedBox.innerHTML = copiedBox.innerHTML.replace(formRegex, `${basePrefix}-${nextShoveBoxIndex}-`);
              // copiedBox.innerHTML = copiedBox.innerHTML.replace(formRegex, basePrefix+"-"+nextShoveBoxIndex.toString()+"-") ;

              // Get the id element  (the child of which the name end with -id) and reset the value
              copiedBox.querySelector('[name$="-id"]').value = "";

              // document.querySelector('[id^="poll-"]').id;
              // The selector means: get an element where the attribute [id] begins with the string "poll-".

              // ^ matches the start
              // * matches any position
              // $ matches the end

              nextShoveBoxIndex++;

              // VERTICAL MOVE
              afterThisBox = insertAfter(copiedBox, afterThisBox);


            };


            break;
          case Operation.Cut:

            // RMove the selected shoveboxes
            moveShoveboxes(callingShoveBox);



            console.log('Cut');
            break;
          default:
            console.log('shoveboxlist.operation: undefined');
            break;
        }

        shoveboxlist.operation = Operation.None;

        // ReCall the function that determines the reference field value
        ContentFormating.autoref(callingShoveBox.parentNode);

        unselectShoveboxes(callingShoveBox.parentNode);



        selectShoveBox(callingShoveBox, true);

        target.focus();

      }
    },
    // { name: 'Delete this record', fn: function (target) { console.log('Geklikt op element met id = ', target.id); } },
    {
      name: 'Delecte Selected Record(s)', fn: function (target) {


        // Get ShoveBox the menuitem was invoked from
        const callingShoveBox = getCorrespondingShoveBoxNode(target);

        for (const box of callingShoveBox.parentNode.querySelectorAll('[shoveboxselected=true]')) {

          box.remove();

        };



      }
    },

    // Separaten line in menu
    {},


    {
      name: 'Unselect', fn: function (target) {


        // Get ShoveBox the menuitem was invoked from
        const callingShoveBox = getCorrespondingShoveBoxNode(target);

        unselectShoveboxes(callingShoveBox.parentNode);

      }
    },

    {},
    { name: 'Print', fn: function (target) 
      { alert('This function is to be implemented in your project. \n Clicked on element with id = '+ target.id ); } 
    },
    { name: 'Settings', fn: function (target) 
      { alert('This function is to be implemented in your project. \n Clicked on element with id = '+ target.id ); } 
    },

  ];

  // https://stackoverflow.com/questions/61135510/add-row-dynamically-in-django-formset
  // https://stackoverflow.com/questions/13387446/changing-the-display-order-of-forms-in-a-formset
  // https://stackoverflow.com/questions/47494507/django-using-can-order-to-change-order-of-forms-in-formset#:~:text=Yes%2C%20by%20specifying%20can_order%3DTrue%20in%20you%20formset_factory%2C%20the,the%20forms%20in%20order%20using%20formset.ordered_forms.%20For%20example%3A

  // Contextmenu type sb_items to open by rightclicking when on the slider 
  var cm2 = new ContextMenu('.slider', sb_items);

  // Contextmenu type sb_items to open by rightclicking when in an shovebox field 
  var cm3 = new ContextMenu('.sbfield', sb_items);

  shoveboxlist.shoveBoxNodes = Array.prototype.slice.call(shoveboxlist.children);


  shoveboxlist.childNodes.forEach(
    function (child) {

      if (child.className == "shovebox") {

        let shovebox = child;
        let slider = shovebox.getElementsByClassName("slider")[0];
        initializeTypeswitches(shovebox);

        // Reposition 
        move(shovebox, slider);

        // ReCall the function that determines the reference field value
        ContentFormating.autoref(shovebox.parentNode);

        var indeks = slider.parentElement.parentElement.shoveBoxNodes.indexOf(slider.parentElement);



        var activeButton = child.getElementsByClassName('typeswitch')[0].querySelectorAll("input[checked]")[0];
        var selectedButtonIndex = parseInt(activeButton.id.slice(-1));


        formatShovebox(child, selectedButtonIndex)


      };
    });

};

function initAllShoveBoxLists() {

  var shoveBoxLists = document.querySelectorAll(".shoveboxlist");
  shoveBoxLists.forEach((item) => {
    initShoveboxlist(item);
    // ReCall the function that determines the reference field value
    ContentFormating.autoref(item);

  });


}


function initializeTypeswitches(shovebox) {
  var buttons = shovebox.getElementsByClassName("typebutton");  // Because this buttons variable is an htmlCollection, we wouldn’t be able to use the forEach method on it; 

  // so we create an array where we can store a non-live version of our htmlCollection using the spread operator.
  var typeButtonArray = [...buttons];



  var indexChecked = -1;

  // Initialize Colors for the typebutton widget
  typeButtonArray.forEach((element, index) => {
    if (element.checked) { indexChecked = index; }
  }
  );

  if (shovebox.attributes["shoveboxselected"] != true) {

    switch (indexChecked) {
      case 0:
        typeButtonArray[0].parentNode.style.backgroundColor = backgrounColors[0];
        typeButtonArray[0].parentNode.style.borderColor = backgrounColors[0];
        break;
      case 1:
        typeButtonArray[1].parentNode.style.backgroundColor = backgrounColors[1];
        typeButtonArray[1].parentNode.style.borderColor = backgrounColors[1];
        break;
      case 2:
        typeButtonArray[2].parentNode.style.backgroundColor = backgrounColors[2];
        typeButtonArray[2].parentNode.style.borderColor = backgrounColors[2];
        break;
      default:
        console.log(`Did not found a single checked 'typebutton' in the RecordType Widget'. Have to bail out. Will look ugly`);
    };

  }

  // add Listeners that determine typebutton colors when clicked 
  typeButtonArray.forEach((element, index) => {
    element.addEventListener("click", () => {

      element.style.opacity = "1";
      // element.checked = true;


      if (index == 0) {
        element.parentNode.style.backgroundColor = backgrounColors[0];
        element.parentNode.style.borderColor = backgrounColors[0];
      }
      else if (index == 1) {
        element.parentNode.style.backgroundColor = backgrounColors[1];
        element.parentNode.style.borderColor = backgrounColors[1];
      }
      else {
        element.parentNode.style.backgroundColor = backgrounColors[2];
        element.parentNode.style.borderColor = backgrounColors[2];
      }
      typeButtonArray
        .filter(function (item) {
          return item != element;
        })
        .forEach((item) => {
          item.style.opacity = "0";
        });
    });
  });
};


// https://stackoverflow.com/questions/68546400/django-create-a-popup-window#:~:text=Instead%20you%20can%20just%20use%20window.open%20%28%29%20like,use%20it%20inline%20in%20a%20template%20like%20this%3A
// https://github.com/django/django/blob/52b054824e899db40ba48f908a9a00dadc56cb89/django/contrib/admin/static/admin/js/admin/RelatedObjectLookups.js#L36
function showPopup(href_rel, name_regexp, add_popup) {
  // const name = addPopupIndex(triggeringLink.id.replace(name_regexp, ''));
  const name = "popup"
  const href = document.location.origin + href_rel;
  if (add_popup) {
    href.searchParams.set('_popup', 1);
  }

  // https://stackoverflow.com/questions/16363474/window-open-on-a-multi-monitor-dual-monitor-system-where-does-window-pop-up

  // window.open(thePage, 'windowName', 'resizable=1, scrollbars=1, fullscreen=0, height=200, width=650, screenX=' + window.leftScreenBoundry() + ' , left=' + window.leftScreenBoundry() + ', toolbar=0, menubar=0, status=1');

  // const win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');
  const win = window.open(href, name, 'resizable=1, scrollbars=1, fullscreen=0, height=200, width=650, toolbar=0, menubar=0, status=1');
  // relatedWindows.push(win);
  win.focus();
  return false;
}


function mouseDown(contentElement) {
  if (!contentElement.parentElement.attributes["class"].value.includes("typeswitch")) {
    if (contentElement.parentNode.attributes["class"].value == "shovebox") {
      contentElement.parentNode.setAttribute('draggable', true);


    }

  }
}

function mouseUp(contentElement) {
  if (!contentElement.parentElement.attributes["class"].value.includes("typeswitch")) {
    if (contentElement.parentNode.attributes["class"].value == "shovebox") {
      dragEnd(contentElement);


    }

  }
}


function dragEnd(contentElement) {

  contentElement.setAttribute('draggable', false);

}







function refMouseOver(contentElement) {

 }


//  Ctrl-Click
//
//  When you hold down the "Ctrl" key and click items in a list, 
// each item remains highlighted. You can select more than one item from any part of the list using Ctrl-Click,
//  such as the first and last items. 
//  When you're done selecting items, release the "Ctrl" key and select the option to process your selections, such as "OK."

//  Shift-Click
//
//  If you want to select more than one item and the items are listed consecutively in the selection box, 
// use the Shift key to quickly select the entire group of entries. 
// Click the first item in the section you want to select to highlight it. 
// Scroll to the last item in the section, hold down the "Shift" key and click the item. 
// Shift-Click selects the first item, last item and all items in between. 
// Use the Ctrl key to select additional items outside of the consecutive group, 
// then click the button to process the selections you highlighted.


function selectShoveBox(shoveBox, true_false) {

  if (shoveBox.parentNode.operation == Operation.None || shoveBox.parentNode.operation == Operation.Paste) {
    shoveBox.setAttribute('targetselected', false);
    shoveBox.setAttribute('shoveboxselected', true_false);

  }
  else {
    shoveBox.setAttribute('targetselected', true_false);

  }
  ;


}


function keyUp(key_event) {

  ctrlKeyDown = false



}

function keyDown(key_event) {

  if (key_event.ctrlKey) {
    ctrlKeyDown = true
  };


}


function inputGotFocus(contentElement) {

  // Mark the shovebox as selected
  selectShoveBox(contentElement.parentElement, true);

}

function inputGotBlurred(contentElement) {

  // When you find an element of class ContextMenu  and  is-open , this means the contextMenu is open

  const contextMenuIsOpen = (document.getElementsByClassName("ContextMenu is-open").length > 0);

  if (!ctrlKeyDown && !contextMenuIsOpen) {
    // Mark the shovebox as selected
    selectShoveBox(contentElement.parentElement, false);
  }
}

function inputHover(contentElement) {

  if (contentElement.className = "slider") {

    contentElement.parentNode.setAttribute('draggable', false);
  }

}

// https://stackoverflow.com/questions/68546400/django-create-a-popup-window#:~:text=Instead%20you%20can%20just%20use%20window.open%20%28%29%20like,use%20it%20inline%20in%20a%20template%20like%20this%3A

function editPopup(shoveBox) {

  var idElement = document.getElementsByName(shoveBox.attributes["shovebox-id"].value + "-id");
  var edit_url = detailEditUrl + idElement[0].value;

  // var indeks = shovebox.parentElement.shoveBoxNodes.indexOf(shoveBox);

  // about to open up a popup window. register this, will be used later on
  window.openedPopup = true
  showPopup(edit_url);

  // After editing in detail popupscreen and closing if valid, reload of the window takes place through the window.focus event (after lostfocus to detail form)
 


  // var txt;
  // if (confirm("This popup windows would enable editing the clicked shovebox = the ShoveBoxList's child with index " + String(indeks))) {
  //   txt = "You pressed OK!";
  // } else {
  //   txt = "You pressed Cancel!";
  // }
  // document.getElementById("popupanchor").innerHTML = txt;
}

function startDraggingShovebox(ev) {

  // event.currentTarget.parentElement.draggedShoveBoxIndex = event.currentTarget.parentElement.shoveBoxNodes.indexOf(ev.currentTarget)
  // ev.dataTransfer.setData( 'text/plain',draggedShoveBoxIndex) 

  ev.currentTarget.style.left = "0px"

  // attach the shovebox to the dragginbg event
  ev.dataTransfer.setData("ShoveBoxID", ev.currentTarget.attributes['shovebox-id'].value);



}

function dragOverPlaceholder(ev) {

  const draggedShoveBoxIndex = ev.currentTarget.parentElement.draggedShoveBoxIndex;
  const placeHolder = ev.currentTarget;
  const placeHolderIndex = placeHolder.parentElement.shoveBoxNodes.indexOf(placeHolder);

  ev.currentTarget.style.height = shoveBoxPlaceHolderOverHeight;

  // preventDefault is necessary to make the placeholder a valid dropping target
  // (otherwise ondrop won't fire)
  ev.preventDefault();
}


function dragLeave(placeholder) {
  // reset to default value
  placeholder.style.height = "";
}

// Almost all elements support the drop target events (dragenter, dragover, dragleave, and drop). 
// However, they don’t allow dropping by default.
// If you drop an element over a drop target that doesn’t allow to drop, the drop event won’t fire.
// To turn an element into a valid drop target, you can override the default behavior 
//of both dragenter and dragover events by calling the event.preventDefault() method in their corresponding event handlers. 

function drop(event) {
  // reset to default value
  event.preventDefault();
  const shoveboxid = event.dataTransfer.getData("shoveboxid");
  const draggedShoveBox = document.querySelectorAll('div.shovebox[shovebox-id=' + shoveboxid + ']')[0];

  const prevTest = event.currentTarget.previousElementSibling

  event.currentTarget.style.height = "";
  if (prevTest.type == "hidden") {
    // prevTest is hidden, this means = MAX_NUMS_FORMS and thus that an attempt is being made
    // to insert a new shovebox at the top of the formset

    const firstShoveBox = event.currentTarget.nextElementSibling;
    if (firstShoveBox.attributes['class'].value == "shovebox") {
      firstShoveBox.parentNode.insertBefore(draggedShoveBox, firstShoveBox);
    }
    else {
      firstShoveBox = firstShoveBox.nextElementSibling;
      if (firstShoveBox.attributes['class'].value == "shovebox") {
        firstShoveBox.parentNode.insertBefore(draggedShoveBox, firstShoveBox);
      }
    }

  }

  else {
    if (prevTest.attributes['class'].value == "shoveboxplaceholder") {
      previousShoveBox = prevTest.previousElementSibling;
    }
    else {
      previousShoveBox = prevTest;
    }


    // MOVE
    insertAfter(draggedShoveBox, previousShoveBox);

  }

  ContentFormating.autoref(draggedShoveBox.parentNode);

}

function getLevel(p_shovebox) {
  return p_shovebox.getElementsByClassName("slider")[0].value;
}


// function getTotalFixedWidth(shovebox)
// {
// // browser Window might have been changed
// var totalFixedWidth = 0;
// shovebox.childNodes.forEach(
//   function (contentelement) {
//       // The read-only nodeType property of a Node interface is an integer that identifies what the node is. 
//       // It distinguishes different kind of nodes from each other, such as elements, text and comments.
//       // 1  Element
//       // 2  Attribute (of an element)
//       // 3  Text (inside an element)
//       // 4  CDATASection
//       // 7  ProcessingInstruction
//       // 8  Comment
//       // 9  Document 
//       // 10 DocumentType
//       // 11 DocumentFragment
//     if (contentelement.nodeType == 1) {
//       // if its the shrinkable (or expandable) field, skip
//       if (contentelement.className != "shrinkable") {
//         //   The HTMLElement.offsetWidth read-only property returns the layout width of an element as an integer. 
//         totalFixedWidth = totalFixedWidth + parseInt(contentelement.offsetWidth);
//       };
//     }
//   }
// );
// return totalFixedWidth;

// }


// https://stackoverflow.com/questions/1442542/how-can-i-get-default-font-size-in-pixels-by-using-javascript-or-jquery

function getDefaultFontSize(pa) {
  pa = pa || document.body;
  var who = document.createElement('div');

  who.style.cssText = 'display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1em';

  who.appendChild(document.createTextNode('M'));
  pa.appendChild(who);
  var fs = [who.offsetWidth, who.offsetHeight];
  pa.removeChild(who);
  return fs;
}

// The shove function can be called by the oninput event of the slider (range) or directly programmatically
function shove(shovebox, levelslider) {

  move(shovebox, levelslider);

  // ReCall the function that determines the reference field value
  ContentFormating.autoref(shovebox.parentNode);

}


function move(shovebox, levelslider) {


  var fontSize = getDefaultFontSize()[1];

  var thumb_in_px = ((levelslider.value - levelslider.min) * ((levelslider.scrollWidth - ((fontSize + 4) * gripwidth)) / (levelslider.max - levelslider.min)));

  // calculate the position after the current slider position from where the first field (typeswitch) can start
  var leftStart = String((thumb_in_px) + ((fontSize + 4) * gripwidth * 1.25)) + 'px';

  var rightMargin = (4 * shoveBoxBorderWidth).toString() + "px";

  //position the typeswitch field 
  shovebox.getElementsByClassName("typeswitch")[0].style.marginLeft = leftStart;

  shovebox.getElementsByClassName("typeswitch")[0].style.marginRight = rightMargin;

  // let the shrinkable field adapt itself to occupy the rest of the available space
  shovebox.getElementsByClassName("shrinkable")[0].style.width = "100%";

};


//  formatting the content
class ContentFormating {

  // renumber the reference field automatically according to the reference algorithm parameter
  static autoref(sblist, p_refAlgorithm) {

    var prev_boxlevel = ""
    var prev_content = ""
    var prev_ref = ""
    var curr_boxlevel = ""
    var curr_content = ""
    var curr_ref = ""

    var firstShoveBoxProcessed = false;

    const lastParent = [];

    const shoveboxes = sblist.getElementsByClassName("shovebox");
    for (const box of shoveboxes) {

      prev_boxlevel = curr_boxlevel
      prev_content = curr_content
      prev_ref = curr_ref

      curr_boxlevel = box.getElementsByClassName("slider")[0].value
      curr_ref = box.getElementsByClassName("ref")[0].value

      // If the index of the shovebox is 0 => means this is the first shovebox
      // if (box.attributes["shovebox-id"].value.slice(-2) == "-0") {

      if (firstShoveBoxProcessed == false) {
        // If the level wasn't 1, make it so
        curr_boxlevel = 0;
        // box.setAttribute("level",1)

        if (curr_ref.length == 0) { curr_ref = 1; }

        else {

          // if ref of first shovebox is 1 => ok else look further
          if (curr_ref.split('.').pop() != 1) {

            if (curr_ref.length) {

              // check if  last character is a period . 
              if (curr_ref.slice(curr_ref.length - 1, curr_ref.length) == ".") {
                curr_ref = curr_ref + "1";
              }
              else {
                curr_ref = curr_ref + ".1";
              }
            }

          };

        }


        // Keep track of references when changing from level
        lastParent[1] = curr_ref;

        firstShoveBoxProcessed = true;

      }


      else {
        // from second to last shovebox


        if (curr_boxlevel > prev_boxlevel) {
          curr_boxlevel = String(Number(prev_boxlevel) + 1);

          // getting at a higher level, remember the last reference of the lower level 
          lastParent[prev_boxlevel] = prev_ref;

          curr_ref = prev_ref + ".1";

        }
        else if (curr_boxlevel < prev_boxlevel) {
          // go on with next reference incrementing the last one from lower level 

          if (lastParent[curr_boxlevel].includes(".")) {

            const index = lastParent[curr_boxlevel].lastIndexOf(".");
            const baseref = lastParent[curr_boxlevel].substring(0, index);
            curr_ref = baseref + "." + String(Number(lastParent[curr_boxlevel].split('.').pop()) + 1);

          }
          else {
            curr_ref = String(Number(lastParent[curr_boxlevel]) + 1);

          }

        }
        // curr_boxlevel == prev_boxlevel
        else {

          if (prev_ref.includes(".")) {

            const index = prev_ref.lastIndexOf(".");
            const baseref = prev_ref.substring(0, index);
            curr_ref = baseref + "." + String(Number(prev_ref.split('.').pop()) + 1);

          }
          else {
            curr_ref = String(Number(prev_ref) + 1);

          }
        }

      }

      box.getElementsByClassName("ref")[0].setAttribute("value", curr_ref);

    }

  }

}


// }


function formatShovebox(p_shoveBox, p_typeIndex) {


  var fieldsArray = p_shoveBox.querySelectorAll("input[visibility],select[visibility],label[visibility]");

  fieldsArray.forEach(
    function (shoveboxField) {

      if (shoveboxField.attributes["visibility"].value.substr(p_typeIndex, 1) == "0") {
        shoveboxField.style.display = "none";
      }
      else {
        shoveboxField.style.display = "initial";
        shoveboxField.style.backgroundColor = backgrounColors[p_typeIndex];
        // fontWeights
      };
    });

}


// https://stackoverflow.com/questions/61135510/add-row-dynamically-in-django-formset

// window.addEventListener('load', (event) => {
// get form template and total number of forms from management form
const templateForm = document.getElementById('id_formset_empty_form');
const inputTotalForms = document.querySelector('input[id$="-TOTAL_FORMS"]');
const inputInitialForms = document.querySelector('input[id$="-INITIAL_FORMS"]');

const buttonAdd = document.getElementById('id_formset_add_button');
const buttonSubmit = document.getElementById('id_formset_submit_button');

// !!!
// NOTE The submit button should trigger the updateNameAttributes function;
// See the formset template
// !!! 

// form counters (note: proper form index bookkeeping is necessary
// because django's formset will create empty forms for any missing
// indices, and will discard forms with indices >= TOTAL_FORMS, which can
// lead to funny behavior in some edge cases)


// extraFormIndices is a 1-dimensional array keeping track of added forms
// if extra > 1 in the django formset factory, the array starts with the 
// numer of the first extra forms 
let extraFormIndices = [];

const initialForms = Number(inputInitialForms.value);
let nextShoveBoxIndex = initialForms;



// Get the Id of the corresponding shoveBox 
function getCorrespondingShoveBoxNode(invoked_from) {

  var corrShovebox = invoked_from;
  if (invoked_from.className.includes("sbfield")) {

    corrShovebox = invoked_from.parentNode;


  };

  return corrShovebox;

};


// Get the Index of the Django Form 
function getFormId(invoked_from) {

  if (invoked_from.className.includes("sbfield")) {

    indeksText = invoked_from.parentNode.attributes["shovebox-id"].value;
    indekslength = basePrefix.length - indeksText.length + 1;
    indeks = parseInt(indeksText.slice(indekslength), 0);

  };

  return indeks;

};


// The user clicked on the switch to change the format 
function switched(selectedButton) {

  var activeShoveBox = selectedButton.parentNode.parentNode;
  var selectedButtonIndex = parseInt(selectedButton.id.slice(-1));
  formatShovebox(activeShoveBox, selectedButtonIndex);

}


document.body.addEventListener('keydown', (event) => {
  keyDown(event);
});


document.body.addEventListener('keyup', (event) => {
  keyUp(event);
});


window.addEventListener('focus', function(){
  console.log('focus');
if (window.hasLostFocus == true) {
  if (  window.openedPopup == true )   {
    document.location.reload(); 

      // reset
    window.hasLostFocus = false
    window.openedPopup = false
  }
    }

});

window.addEventListener('blur', function(){     

  window.hasLostFocus = true


  console.log('leave');
});



document.addEventListener('DOMContentLoaded', (event) => {
  // first time initialization of the window
  initAllShoveBoxLists();
  window.onresize = initAllShoveBoxLists;
  // var shoveboxContents = document.getElementsByClassName("shoveboxcontent");


  // If the django-calculation app is used, trigger it
  if (window.calculatedFields) {
    const calculatedfields = window.calculatedFields
    if (calculatedfields) {
      for (let index = 0; index < calculatedFields.length; index++) {
        let obj = calculatedFields[index];
        obj.executeAll();
        obj.field.dispatchEvent(new Event('oncalculate'));
      }


    };
  }

});


