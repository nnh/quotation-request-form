function setYears(){
  const listItems = FormApp.getActiveForm().getItems(FormApp.ItemType.LIST).map(x => x.asListItem());
  const target = listItems.filter(x => /年/.test(x.getTitle()));
  const thisYear = new Date().getFullYear();
  const yearList = [...Array(10).keys()].map((_, idx) => `${thisYear + idx}年`);
  target.forEach(list => list.setChoices(yearList.map(x => list.createChoice(x))));
}
function createSs(){
  const user = Session.getActiveUser().getUserLoginId();
  const resList = FormApp.getActiveForm().getResponses(); 
  // Retrieve the most recent input information.
  const target = resList.filter(x => x.getRespondentEmail() === user).filter((_, idx, arr) => idx === arr.length - 1)[0];
  const items = new Map();
  target.getItemResponses().forEach(item => items.set(item.getItem().getTitle(), item.getResponse()));
  quotetest20230125.testCreateSs(items);
}
