require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const a = ["df"];
let k = 0;
let i = 0;
const pwd = process.env.ATLAS;
mongoose.connect("mongodb+srv://user_me:"+pwd+"@cluster0.ptvlh.mongodb.net/todoappDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false});
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

const itemSchema = {
  todo: {
    type:String,
  },
  delId: Number
}
const listSchema = {
  listName: {
    required: true,
    type:String
  },
  item: [itemSchema]
}
const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);
app.post("/addList",function(req,res) {
  const listName = req.body.list_name;
  if(listName==="")
  res.redirect("/");
  else {
  List.findOne({listName:listName},function(err,result) {
    if(err)
    console.log(err);
    else {
      if(!result) {
        console.log(listName+">>>>>");
        const list = new List( {
          listName: listName,
          item: []
        });
        list.save(function(err) {
          if(!err) {
            res.redirect("/list/"+listName);
          }
        });
      }
      else {
        res.redirect("/list/"+listName);
      }
    }
  });
}
});
app.post("/mark",function(req,res) {
  const get = req.body.check;
  console.log(get);
  if(Array.isArray(get)) {
    const item = get[0];
    const arr = item.split(" ");
    const id = arr[1];
    const name = arr[0];
    if(name=="") {
      Item.findOneAndUpdate({_id:id},{delId:1},function(err,result) {
        if(err)
        console.log(err);
        res.redirect("/");
      });
    }
    else {
      List.findOneAndUpdate({listName: name,"item._id":id},{"$set":{"item.$.delId":1}},function(err,result) {
        if(err)
        console.log(err);
        res.redirect("/list/"+name);
      });
    }
  }
  else {
    const arr = get.split(" ");
    const id = arr[1];
    const name = arr[0];
    if(name=="") {
      Item.findOneAndUpdate({_id:id},{delId:0},function(err,result) {
        if(err)
        console.log(err);
        else {
          console.log(result+"?????<><");
          res.redirect("/");
        }
      });
  }
  else {
    List.findOneAndUpdate({listName: name,"item._id":id},{"$set":{"item.$.delId":0}},function(err,result) {
      if(err)
      console.log(err);
      else {
        console.log(result+"//");
        res.redirect("/list/"+name);
      }
    });
  }
}
});
app.post("/add", function(req,res) {
  const task = req.body.list_item;
  console.log(task);
  const listName = req.body.enter;
  console.log(listName+"<><><><>");
  const item = new Item( {
    todo: task,
    delId: 0
  });
  if(listName==="") {
    console.log("////");
    item.save(function(err){
      if(!err)
      res.redirect("/");
    });
  }
  else {
    List.findOne({listName:listName}, async function(err,key) {
      console.log("12233344");
      if(err)
      console.log(err);
      else {
        console.log(key+"{}");
        key.item.push(item);
        key.save(function(err) {
          if(!err)
          res.redirect("/list/"+listName);
        });
      }
    });
  }
});
// delete list
app.get("/dellist/:listid", function(req,res) {
  const id = req.params.listid;
  List.deleteOne({_id: id}, function(err,result) {
    if(err)
    console.log(err);
    else {
      console.log(result+"[}{}]");
      res.redirect("/");
    }
  });
});
// completd filter for home page
app.get("/comp",async function(req,res) {
  let listArr = [];
  await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      listArr = result;
        }
  });
  Item.find({delId:1},function(err,result) {
    if(err)
    console.log(err);
    else {
      res.render("todo",{items:result,title:"",checked:"checked",listArr: listArr})
    }
  });
});
// all filter for home page
app.get("/all", function(req,res) {
  res.redirect("/");
});
// all filter for custom list
app.get("/all/:name", function(req,res) {
  const listName = req.params.name;
  res.redirect("/list/"+listName);
});
// completed filter for custom list
app.get("/comp/:name",async function(req,res) {
  const name = req.params.name;
  const arr = [];
  let listArr = [];
  await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      listArr = result;
        }
  });
  List.findOne({listName: name},function(err,result) {
    if(err)
    console.log(err);
    else {
      result.item.forEach(function(elem) {
        if(elem.delId===1) {
          arr.push(elem);
        }
      });
      console.log(arr+"/>?>");
      const len = result.item.length;
      res.render("todo",{items:arr,title:name,checked:"checked",len: len,listArr: listArr})
    }
  });
});
// active filter for home page
app.get("/active",async function(req,res) {
  let listArr = [];
  await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      listArr = result;
        }
  });
  Item.find({delId:0},function(err,result) {
    if(err)
    console.log(err);
    else {
      const len = result.length;
      res.render("todo",{items:result,title:"",checked:"checked",len: len,listArr: listArr})
    }
  });
});
// active filter for custom list page
app.get("/active/:listName",async function(req,res) {
  const name = req.params.listName;
  const arr = [];
  let listArr = [];
  await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      listArr = result;
        }
  });
  List.findOne({listName: name},function(err,result) {
    if(err)
    console.log(err);
    else {
      result.item.forEach(function(elem) {
        if(elem.delId===0) {
          arr.push(elem);
        }
      });
      const len = result.item.length;
      console.log(arr+"/>?>");
      res.render("todo",{items:arr,title:name,checked:"checked",len:len,listArr:listArr})
    }
  });
});
// del when request for items in home page
app.get("/del",function(req,res) {
  Item.deleteMany({delId:1}, function(err,result) {
    if(!err)
    res.redirect("/");
  });
});
// del when items in customList
app.get("/del/:deldet",function(req,res) {
  const name = req.params.deldet;
  List.findOneAndUpdate({listName:name},{$pull: {item: {delId:1}}},function(err,result) {
    if(err)
    console.log(err);
    else {
      console.log(result+"?>><");
      res.redirect("/list/"+name);
    }
  });
});
// handles request for custonListName
app.get("/list/:listName", async function(req,res) {
  const name = req.params.listName;
  console.log(name+"?????????????????");
  let listArr = [];
   await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      listArr = result;
        }
  });
  List.findOne({listName:name},function(err,result) {
    // console.log(name+">>>");
    if(err)
    console.log(err);
    else {
      const len = result.item.length;
      console.log(result);
      res.render("todo",{items:result.item,title:name,len: len,listArr: listArr});
    }
  });
});
// handles request for homepage
app.get("/", async function(req,res) {
  let listArr = [];
  await List.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
      console.log(".............................");
      listArr = result;
        }
  });
  console.log(listArr+"??>>??>??>?");
  Item.find({},function(err,result) {
    if(err)
    console.log(err);
    else {
        const len = result.length;
        res.render("todo",{items:result,title:"",checked:"checked",len: len,listArr: listArr});
      i++;
    }
  });
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function() {
  console.log("server started");
});
