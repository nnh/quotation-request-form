const maxRetryCount = 2;
/**
 * Set the year for form entry items.
 * @param none.
 * @return none.
 */
function setYears(){
  const setYear = new SetYears();
  setYear.setCheckBox();
  setYear.setList();
}
class SetYears{
  constructor(){
    const thisYear = new Date().getFullYear();
    this.yearList = [...Array(10).keys()].map((_, idx) => `${thisYear + idx}年`); 
  }
  setList(){
    this.setChoiceItems(FormApp.ItemType.LIST, '年');
  }
  setCheckBox(){
    this.setChoiceItems(FormApp.ItemType.CHECKBOX, '中間解析の頻度');
  }
  setChoiceItems(itemType, targetTitle){
    const items = itemType === FormApp.ItemType.LIST 
      ? FormApp.getActiveForm().getItems(FormApp.ItemType.LIST).map(x => x.asListItem())
      : FormApp.getActiveForm().getItems(FormApp.ItemType.CHECKBOX).map(x => x.asCheckboxItem());
    const target = items.filter(x => new RegExp(targetTitle).test(x.getTitle()));
    target.forEach(list => list.setChoices(this.yearList.map(x => list.createChoice(x))));
  }
}
/**
 * Create a spreadsheet from form entries.
 * @param none.
 * @return none.
 */
function createSs(){
  let retryUserCount = 0;
  let user;
  let resError = null;
  while (retryUserCount < maxRetryCount){
    try{
      user = Session.getActiveUser().getUserLoginId();
      resError = null;
      break;
    } catch (error){
      resError = error;
      Utilities.sleep(1000);
    }
    retryUserCount++;
  }
  if (resError !== null){
    sendMailResult_(user, 'error:quotation-request-form', `セッション取得エラーが発生したためquotation-request-formが異常終了しました。`);
    return;
  }
  let retrygetResponsesCount = 0;
  let resList;
  while (retrygetResponsesCount < maxRetryCount){
    try{
      resList = FormApp.getActiveForm().getResponses(); 
      resError = null;
      break;
    } catch (error){
      resError = error;
      Utilities.sleep(1000);
    }
    retrygetResponsesCount++;
  }
  if (resError !== null){
    sendMailResult_(user, 'error:quotation-request-form', `レスポンス取得エラーが発生したためquotation-request-formが異常終了しました。`);
    return;
  }
  // Retrieve the most recent input information.
  const target = resList.filter(x => x.getRespondentEmail() === user).filter((_, idx, arr) => idx === arr.length - 1)[0];
  const items = quotegenerator2.getItemsFromFormRequests(target);
  const res = quotegenerator2.createSpreadsheet(items);
  if (typeof(res) !== 'string'){
    sendMailResult_(PropertiesService.getScriptProperties().getProperty('administratorEmailAddress'), 'error:quotation-request-form', `quotation-request-formでエラーが発生しました。\n${res.name}:${res.message}\n${Array.from(items)}`);
    console.log(`${res.name}:${res.message}`);
    return;
  }
  sendMailResult_(user, 'test', `${res}の作成が完了しました。Googleドライブのマイドライブをご確認ください。`);
}
/**
 * Send email.
 * @param {string} mailAddress Email address to be sent to.
 * @param {string} title Email Subject.
 * @param {string} body Email Body.
 * @return none.
 */
function sendMailResult_(mailAddress, title, body){
  let retryCount = 0;
  let res;
  while (retryCount < maxRetryCount){
    try{
      GmailApp.sendEmail(mailAddress, title, body);
      res = null;
      break;
    } catch (error){
      res = error;
      Utilities.sleep(1000);
    }
    retryCount++;
  }
  if (res !== null){
    console.log(`${res.name}:${res.message}`);    
  }
}