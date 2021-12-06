var CURRENT_COIN = 'TDC';
var PARAMS = {
	'TDC': {
		coingecko: 'tidecoin',
		coinjs: cc.bitcoin,
		network: cc.bitcoin.networks.litecoin,
		qrColor: '5C5C5C',
		minFee: 0.001,
		maxFee: 0.001,
		txFee:  0.001,
		precision: 8,
		explorer: 'http://explorer.tdc.cash/',
        donation: 'TUgBCrnpaMymxNppC14TeZc6HvgPUr8GGX',
        donationAmount: 0.005,
		unspentApi: 'https://tdc.cash/api/TDC/mainnet/address/',
		sendApi: 'https://tdc.cash/api/TDC/mainnet/tx/send',
		sendTxHex: 'rawTx',
		sendTxid1: 'txid',
		unspentTxid: 'mintTxid',
		unspentOutput: 'mintIndex',
		unspentValue: 'value',
		unspentDivision: 100000000
	}
};

function intToByteArray(int) {
    var byteArray = [0];
    if (int > 8388607) byteArray = [0, 0, 0, 0];
    else if (int > 32767) byteArray = [0, 0, 0];
    else if (int > 127) byteArray = [0, 0];

    for ( var index = 0; index < byteArray.length; index++ ) {
        var byte = int & 0xff;
        byteArray [ index ] = byte;
        int = (int - byte) / 256 ;
    }

    return byteArray;
}

window.Clipboard = (function(window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function(text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);

var scanner;
var qrIdToFill;
function openQrModal(param) {
  qrIdToFill = param;
  scanner = new Instascan.Scanner({ video: document.getElementById('qrScannerPreview') });

  scanner.addListener('scan', function (content) {
    scanner.stop();
    $('#' + qrIdToFill).val(content);
    $('#' + qrIdToFill).change();
    $('#modalQrCode').modal('toggle');
  });

  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 1) {
      scanner.start(cameras[0]);
    } else if(cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      $('#modalQrCode').modal('toggle');
      alert('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });

  $('#modalQrCode').modal('toggle');
}

function closeQrModal() {
  scanner.stop();
}

function eyeFunction(id) {
  var x = document.getElementById(id);
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

var passphrase="";
var passphrase2="";
var hashedPass="";
var loginPrivkey="";
var keyPair="";
function hashit(hash, callback) {
  for(i=0; i<100*1440; i++) {
    hash = cc.bitcoin.crypto.keccak256(hash+passphrase);
    hash = hash.toString("hex");
  }

  hashedPass = hash;
  callback(hash);
}

async function login() {
  // Make sure the password is strong enough
  if( $('ul.error-list').html() != "" || $('span.password-verdict').html() != "Very Strong" ) { alert("You need a stronger password! Try choosing a longer password(at least 14 characters recommended), with both uppercase and lowercase characters as well as numbers and special characters."); return; }

  // Login with private key
  // TODO: Add the ability to login with BTC or LTC private keys

  // Login with nickname + password
  passphrase = $("#nickname").val() + ';'+ $("#password").val();
  nickname1 = $("#nickname").val();
  password1 = $("#password").val();
  $('#nickname').prop("disabled", true);
  $('#password').prop("disabled", true);
  $('#signin').prop("disabled", true);
  $("#loginprogress").show();
  $("form[role='login']").click();
 if (!keyPair){
        const baseKey= await crypto.subtle.importKey("raw", asciiToUint8Array(passphrase), "PBKDF2", false, ["deriveBits"]);
        const result= await crypto.subtle.deriveBits({name: "PBKDF2", salt: hexStringToUint8Array("aaef2d3f4d77ac66e9c5a6c3d8f921d1"), iterations: 500000, hash: "sha-512"}, baseKey, 384);
        keyPair = new PARAMS[CURRENT_COIN].coinjs.ECPair(bytesToHexString(result), { network: PARAMS[CURRENT_COIN].network });
        loadAddress();
 }
}

async function login2() {
  passphrase2 = $("#phrase24").val();
  $('#phrase24').prop("disabled", true);
  $("#loginprogress2").show();
  $("form[role='login2']").click();
 if (!keyPair){
        const baseKey= await crypto.subtle.importKey("raw", asciiToUint8Array(passphrase2), "PBKDF2", false, ["deriveBits"]);
        const result= await crypto.subtle.deriveBits({name: "PBKDF2", salt: hexStringToUint8Array("aaef2d3f4d77ac66e9c5a6c3d8f921d1"), iterations: 500000, hash: "sha-512"}, baseKey, 384);
        keyPair = new PARAMS[CURRENT_COIN].coinjs.ECPair(bytesToHexString(result), { network: PARAMS[CURRENT_COIN].network });
        loadAddress2();
 }
}



function loadAddress() {
  var ZERO = 0;
  $("#addr-balance-refresh").prop("disabled", true);
  $('#addr-balance').html('Balance: ' + ZERO.toFixed(PARAMS[CURRENT_COIN].precision) + ' ' + CURRENT_COIN);
  $("#addr-balance").css("color", "#74bed8");
  $("#pwd-container").show();
  $("#addr-container").show();
  $("#loginprogress").hide();
  $("#signin").hide();
  $("#newaddress").show();
  passphrase = $("#nickname").val() + ';'+ $("#password").val();
  $("#priv-qr").attr("alt", passphrase);
  $("#priv-nickname").html(nickname1);
  $("#priv-password").html(password1);
  $("#tdcaddress").html(keyPair.getAddress());
  var qrcodeAddress=new QRCode(document.getElementById("qrcodeAddress"),{width: 132, height: 132, text:keyPair.getAddress()});
  var qrcodePrivate=new QRCode(document.getElementById("qrcodePrivate"),{width: 164, height: 164, text:"Nickname: " + nickname1 + " Password: " + password1});  
  $("#addr-id-clipboard").attr("data-clipboard-text", keyPair.getAddress());
  $("#addr-id").attr("href", PARAMS[CURRENT_COIN].explorer + "address/" + keyPair.getAddress());
  $("#addr-id").html(keyPair.getAddress());
  changeAddress = keyPair.getAddress();
  refresh();
}
function loadAddress2() {
  var ZERO = 0;
  $("#addr-balance-refresh").prop("disabled", true);
  $('#addr-balance').html('Balance: ' + ZERO.toFixed(PARAMS[CURRENT_COIN].precision) + ' ' + CURRENT_COIN);
  $("#addr-balance").css("color", "#74bed8");
  $("#pwd-container").hide();
  $("#addr-container").show();
  $("#loginprogress2").hide();
  $("#newaddress2").show();
  $("#signin2").hide();
  $("#phrase24").hide();
  $("#random24").hide();
  $("#newaddress").show();
  passphrase2 = $("#phrase24").val();
  $("#priv-qr").attr("alt", passphrase2);
  $("#tdcaddress").html(keyPair.getAddress());
  $("#mnem-seed").html(passphrase2);
  var qrcodeAddress2=new QRCode(document.getElementById("qrcodeAddress"),{width: 132, height: 132, text:keyPair.getAddress()});
  var qrcodePrivate2=new QRCode(document.getElementById("qrcodePrivate"),{width: 164, height: 164, text:passphrase2});
  $("#addr-id-clipboard").attr("data-clipboard-text", keyPair.getAddress());
  $("#addr-id").attr("href", PARAMS[CURRENT_COIN].explorer + "address/" + keyPair.getAddress());
  $("#addr-id").html(keyPair.getAddress());
  changeAddress = keyPair.getAddress();
  refresh();
}
function refresh() {
  $.ajax({
    url: PARAMS[CURRENT_COIN].unspentApi + keyPair.getAddress() + '/?unspent=true',
    type: "GET",
    dataType: "json",
    data: {
    },
    success: function (result) {
        loadAddressTxes(result);
	$("#addr-balance-refresh").prop("disabled", false);
	$("#addr-balance").css("color", "");
    },
    error: function () {
        console.log("error");
	$("#addr-balance-refresh").prop("disabled", false);
    }
  });
}

var USD = false;
var usdBalance = false;
var balance=0;
var hodlBestRate=0;
var hodlRate=0;
var isHODLing=0;
var changeAddress="";
var utxos=[];
function loadAddressTxes(result) {
  var sum = 0;
  var F1 = PARAMS[CURRENT_COIN].unspentArray1;
  var F2 = PARAMS[CURRENT_COIN].unspentArray2;
  console.log(result)
  if(F1 && F2) {
     utxos = result[F1][F2];
  } else if(F1) {
     utxos = result[F1];
  } else { utxos=result; }

  for(i in utxos) {
    sum += Number(utxos[i][PARAMS[CURRENT_COIN].unspentValue]/PARAMS[CURRENT_COIN].unspentDivision);
  } balance = sum;

  USD = false;
  usdBalance = false;
  $('#addr-balance').html('Balance: ' + balance.toFixed(PARAMS[CURRENT_COIN].precision) + ' ' + CURRENT_COIN);
}

function _setTooltip(message, classId) {
  $(classId)
    .attr('data-original-title', message)
    .tooltip('show');
  }

function _hideTooltip(classId) {
  setTimeout(function() {
    $(classId).attr('data-original-title', '').tooltip('hide');
  }, 1000);
}


function copyPrivateKey() {
  var result = prompt("This operation will copy your private key to clipboard. Your private key is very important and anyone who has it will be able to spend from your account. You should never share your private key with anyone.\n\nType 'Yes' with capital 'Y' to continue:", "No");
  if(result == 'Yes') {
  keyPair.toWIF()
  }
}

function openmnemonic() {
  window.location.href = 'mnem.html';
}
function openlogpass() {
  window.location.href = 'index.html';
}

function mnem24() {
var words = ["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse",
"access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act",
"action","actor","actress","actual","adapt","add","addict","address","adjust","admit",
"adult","advance","advice","aerobic","affair","afford","afraid","again","age","agent",
"agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert",
"alien","all","alley","allow","almost","alone","alpha","already","also","alter",
"always","amateur","amazing","among","amount","amused","analyst","anchor","ancient","anger",
"angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique",
"anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic",
"area","arena","argue","arm","armed","armor","army","around","arrange","arrest",
"arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset",
"assist","assume","asthma","athlete","atom","attack","attend","attitude","attract","auction",
"audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake",
"aware","away","awesome","awful","awkward","axis","baby","bachelor","bacon","badge",
"bag","balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain",
"barrel","base","basic","basket","battle","beach","bean","beauty","because","become",
"beef","before","begin","behave","behind","believe","below","belt","bench","benefit",
"best","betray","better","between","beyond","bicycle","bid","bike","bind","biology",
"bird","birth","bitter","black","blade","blame","blanket","blast","bleak","bless",
"blind","blood","blossom","blouse","blue","blur","blush","board","boat","body",
"boil","bomb","bone","bonus","book","boost","border","boring","borrow","boss",
"bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread",
"breeze","brick","bridge","brief","bright","bring","brisk","broccoli","broken","bronze",
"broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb",
"bulk","bullet","bundle","bunker","burden","burger","burst","bus","business","busy",
"butter","buyer","buzz","cabbage","cabin","cable","cactus","cage","cake","call",
"calm","camera","camp","can","canal","cancel","candy","cannon","canoe","canvas",
"canyon","capable","capital","captain","car","carbon","card","cargo","carpet","carry",
"cart","case","cash","casino","castle","casual","cat","catalog","catch","category",
"cattle","caught","cause","caution","cave","ceiling","celery","cement","census","century",
"cereal","certain","chair","chalk","champion","change","chaos","chapter","charge","chase",
"chat","cheap","check","cheese","chef","cherry","chest","chicken","chief","child",
"chimney","choice","choose","chronic","chuckle","chunk","churn","cigar","cinnamon","circle",
"citizen","city","civil","claim","clap","clarify","claw","clay","clean","clerk",
"clever","click","client","cliff","climb","clinic","clip","clock","clog","close",
"cloth","cloud","clown","club","clump","cluster","clutch","coach","coast","coconut",
"code","coffee","coil","coin","collect","color","column","combine","come","comfort",
"comic","common","company","concert","conduct","confirm","congress","connect","consider","control",
"convince","cook","cool","copper","copy","coral","core","corn","correct","cost",
"cotton","couch","country","couple","course","cousin","cover","coyote","crack","cradle",
"craft","cram","crane","crash","crater","crawl","crazy","cream","credit","creek",
"crew","cricket","crime","crisp","critic","crop","cross","crouch","crowd","crucial",
"cruel","cruise","crumble","crunch","crush","cry","crystal","cube","culture","cup",
"cupboard","curious","current","curtain","curve","cushion","custom","cute","cycle","dad",
"damage","damp","dance","danger","daring","dash","daughter","dawn","day","deal",
"debate","debris","decade","december","decide","decline","decorate","decrease","deer","defense",
"define","defy","degree","delay","deliver","demand","demise","denial","dentist","deny",
"depart","depend","deposit","depth","deputy","derive","describe","desert","design","desk",
"despair","destroy","detail","detect","develop","device","devote","diagram","dial","diamond",
"diary","dice","diesel","diet","differ","digital","dignity","dilemma","dinner","dinosaur",
"direct","dirt","disagree","discover","disease","dish","dismiss","disorder","display","distance",
"divert","divide","divorce","dizzy","doctor","document","dog","doll","dolphin","domain",
"donate","donkey","donor","door","dose","double","dove","draft","dragon","drama",
"drastic","draw","dream","dress","drift","drill","drink","drip","drive","drop",
"drum","dry","duck","dumb","dune","during","dust","dutch","duty","dwarf",
"dynamic","eager","eagle","early","earn","earth","easily","east","easy","echo",
"ecology","economy","edge","edit","educate","effort","egg","eight","either","elbow",
"elder","electric","elegant","element","elephant","elevator","elite","else","embark","embody",
"embrace","emerge","emotion","employ","empower","empty","enable","enact","end","endless",
"endorse","enemy","energy","enforce","engage","engine","enhance","enjoy","enlist","enough",
"enrich","enroll","ensure","enter","entire","entry","envelope","episode","equal","equip",
"era","erase","erode","erosion","error","erupt","escape","essay","essence","estate",
"eternal","ethics","evidence","evil","evoke","evolve","exact","example","excess","exchange",
"excite","exclude","excuse","execute","exercise","exhaust","exhibit","exile","exist","exit",
"exotic","expand","expect","expire","explain","expose","express","extend","extra","eye",
"eyebrow","fabric","face","faculty","fade","faint","faith","fall","false","fame",
"family","famous","fan","fancy","fantasy","farm","fashion","fat","fatal","father",
"fatigue","fault","favorite","feature","february","federal","fee","feed","feel","female",
"fence","festival","fetch","fever","few","fiber","fiction","field","figure","file",
"film","filter","final","find","fine","finger","finish","fire","firm","first",
"fiscal","fish","fit","fitness","fix","flag","flame","flash","flat","flavor",
"flee","flight","flip","float","flock","floor","flower","fluid","flush","fly",
"foam","focus","fog","foil","fold","follow","food","foot","force","forest",
"forget","fork","fortune","forum","forward","fossil","foster","found","fox","fragile",
"frame","frequent","fresh","friend","fringe","frog","front","frost","frown","frozen",
"fruit","fuel","fun","funny","furnace","fury","future","gadget","gain","galaxy",
"gallery","game","gap","garage","garbage","garden","garlic","garment","gas","gasp",
"gate","gather","gauge","gaze","general","genius","genre","gentle","genuine","gesture",
"ghost","giant","gift","giggle","ginger","giraffe","girl","give","glad","glance",
"glare","glass","glide","glimpse","globe","gloom","glory","glove","glow","glue",
"goat","goddess","gold","good","goose","gorilla","gospel","gossip","govern","gown",
"grab","grace","grain","grant","grape","grass","gravity","great","green","grid",
"grief","grit","grocery","group","grow","grunt","guard","guess","guide","guilt",
"guitar","gun","gym","habit","hair","half","hammer","hamster","hand","happy",
"harbor","hard","harsh","harvest","hat","have","hawk","hazard","head","health",
"heart","heavy","hedgehog","height","hello","helmet","help","hen","hero","hidden",
"high","hill","hint","hip","hire","history","hobby","hockey","hold","hole",
"holiday","hollow","home","honey","hood","hope","horn","horror","horse","hospital",
"host","hotel","hour","hover","hub","huge","human","humble","humor","hundred",
"hungry","hunt","hurdle","hurry","hurt","husband","hybrid","ice","icon","idea",
"identify","idle","ignore","ill","illegal","illness","image","imitate","immense","immune",
"impact","impose","improve","impulse","inch","include","income","increase","index","indicate",
"indoor","industry","infant","inflict","inform","inhale","inherit","initial","inject","injury",
"inmate","inner","innocent","input","inquiry","insane","insect","inside","inspire","install",
"intact","interest","into","invest","invite","involve","iron","island","isolate","issue",
"item","ivory","jacket","jaguar","jar","jazz","jealous","jeans","jelly","jewel",
"job","join","joke","journey","joy","judge","juice","jump","jungle","junior",
"junk","just","kangaroo","keen","keep","ketchup","key","kick","kid","kidney",
"kind","kingdom","kiss","kit","kitchen","kite","kitten","kiwi","knee","knife",
"knock","know","lab","label","labor","ladder","lady","lake","lamp","language",
"laptop","large","later","latin","laugh","laundry","lava","law","lawn","lawsuit",
"layer","lazy","leader","leaf","learn","leave","lecture","left","leg","legal",
"legend","leisure","lemon","lend","length","lens","leopard","lesson","letter","level",
"liar","liberty","library","license","life","lift","light","like","limb","limit",
"link","lion","liquid","list","little","live","lizard","load","loan","lobster",
"local","lock","logic","lonely","long","loop","lottery","loud","lounge","love",
"loyal","lucky","luggage","lumber","lunar","lunch","luxury","lyrics","machine","mad",
"magic","magnet","maid","mail","main","major","make","mammal","man","manage",
"mandate","mango","mansion","manual","maple","marble","march","margin","marine","market",
"marriage","mask","mass","master","match","material","math","matrix","matter","maximum",
"maze","meadow","mean","measure","meat","mechanic","medal","media","melody","melt",
"member","memory","mention","menu","mercy","merge","merit","merry","mesh","message",
"metal","method","middle","midnight","milk","million","mimic","mind","minimum","minor",
"minute","miracle","mirror","misery","miss","mistake","mix","mixed","mixture","mobile",
"model","modify","mom","moment","monitor","monkey","monster","month","moon","moral",
"more","morning","mosquito","mother","motion","motor","mountain","mouse","move","movie",
"much","muffin","mule","multiply","muscle","museum","mushroom","music","must","mutual",
"myself","mystery","myth","naive","name","napkin","narrow","nasty","nation","nature",
"near","neck","need","negative","neglect","neither","nephew","nerve","nest","net",
"network","neutral","never","news","next","nice","night","noble","noise","nominee",
"noodle","normal","north","nose","notable","note","nothing","notice","novel","now",
"nuclear","number","nurse","nut","oak","obey","object","oblige","obscure","observe",
"obtain","obvious","occur","ocean","october","odor","off","offer","office","often",
"oil","okay","old","olive","olympic","omit","once","one","onion","online",
"only","open","opera","opinion","oppose","option","orange","orbit","orchard","order",
"ordinary","organ","orient","original","orphan","ostrich","other","outdoor","outer","output",
"outside","oval","oven","over","own","owner","oxygen","oyster","ozone","pact",
"paddle","page","pair","palace","palm","panda","panel","panic","panther","paper",
"parade","parent","park","parrot","party","pass","patch","path","patient","patrol",
"pattern","pause","pave","payment","peace","peanut","pear","peasant","pelican","pen",
"penalty","pencil","people","pepper","perfect","permit","person","pet","phone","photo",
"phrase","physical","piano","picnic","picture","piece","pig","pigeon","pill","pilot",
"pink","pioneer","pipe","pistol","pitch","pizza","place","planet","plastic","plate",
"play","please","pledge","pluck","plug","plunge","poem","poet","point","polar",
"pole","police","pond","pony","pool","popular","portion","position","possible","post",
"potato","pottery","poverty","powder","power","practice","praise","predict","prefer","prepare",
"present","pretty","prevent","price","pride","primary","print","priority","prison","private",
"prize","problem","process","produce","profit","program","project","promote","proof","property",
"prosper","protect","proud","provide","public","pudding","pull","pulp","pulse","pumpkin",
"punch","pupil","puppy","purchase","purity","purpose","purse","push","put","puzzle",
"pyramid","quality","quantum","quarter","question","quick","quit","quiz","quote","rabbit",
"raccoon","race","rack","radar","radio","rail","rain","raise","rally","ramp",
"ranch","random","range","rapid","rare","rate","rather","raven","raw","razor",
"ready","real","reason","rebel","rebuild","recall","receive","recipe","record","recycle",
"reduce","reflect","reform","refuse","region","regret","regular","reject","relax","release",
"relief","rely","remain","remember","remind","remove","render","renew","rent","reopen",
"repair","repeat","replace","report","require","rescue","resemble","resist","resource","response",
"result","retire","retreat","return","reunion","reveal","review","reward","rhythm","rib",
"ribbon","rice","rich","ride","ridge","rifle","right","rigid","ring","riot",
"ripple","risk","ritual","rival","river","road","roast","robot","robust","rocket",
"romance","roof","rookie","room","rose","rotate","rough","round","route","royal",
"rubber","rude","rug","rule","run","runway","rural","sad","saddle","sadness",
"safe","sail","salad","salmon","salon","salt","salute","same","sample","sand",
"satisfy","satoshi","sauce","sausage","save","say","scale","scan","scare","scatter",
"scene","scheme","school","science","scissors","scorpion","scout","scrap","screen","script",
"scrub","sea","search","season","seat","second","secret","section","security","seed",
"seek","segment","select","sell","seminar","senior","sense","sentence","series","service",
"session","settle","setup","seven","shadow","shaft","shallow","share","shed","shell",
"sheriff","shield","shift","shine","ship","shiver","shock","shoe","shoot","shop",
"short","shoulder","shove","shrimp","shrug","shuffle","shy","sibling","sick","side",
"siege","sight","sign","silent","silk","silly","silver","similar","simple","since",
"sing","siren","sister","situate","six","size","skate","sketch","ski","skill",
"skin","skirt","skull","slab","slam","sleep","slender","slice","slide","slight",
"slim","slogan","slot","slow","slush","small","smart","smile","smoke","smooth",
"snack","snake","snap","sniff","snow","soap","soccer","social","sock","soda",
"soft","solar","soldier","solid","solution","solve","someone","song","soon","sorry",
"sort","soul","sound","soup","source","south","space","spare","spatial","spawn",
"speak","special","speed","spell","spend","sphere","spice","spider","spike","spin",
"spirit","split","spoil","sponsor","spoon","sport","spot","spray","spread","spring",
"spy","square","squeeze","squirrel","stable","stadium","staff","stage","stairs","stamp",
"stand","start","state","stay","steak","steel","stem","step","stereo","stick",
"still","sting","stock","stomach","stone","stool","story","stove","strategy","street",
"strike","strong","struggle","student","stuff","stumble","style","subject","submit","subway",
"success","such","sudden","suffer","sugar","suggest","suit","summer","sun","sunny",
"sunset","super","supply","supreme","sure","surface","surge","surprise","surround","survey",
"suspect","sustain","swallow","swamp","swap","swarm","swear","sweet","swift","swim",
"swing","switch","sword","symbol","symptom","syrup","system","table","tackle","tag",
"tail","talent","talk","tank","tape","target","task","taste","tattoo","taxi",
"teach","team","tell","ten","tenant","tennis","tent","term","test","text",
"thank","that","theme","then","theory","there","they","thing","this","thought",
"three","thrive","throw","thumb","thunder","ticket","tide","tiger","tilt","timber",
"time","tiny","tip","tired","tissue","title","toast","tobacco","today","toddler",
"toe","together","toilet","token","tomato","tomorrow","tone","tongue","tonight","tool",
"tooth","top","topic","topple","torch","tornado","tortoise","toss","total","tourist",
"toward","tower","town","toy","track","trade","traffic","tragic","train","transfer",
"trap","trash","travel","tray","treat","tree","trend","trial","tribe","trick",
"trigger","trim","trip","trophy","trouble","truck","true","truly","trumpet","trust",
"truth","try","tube","tuition","tumble","tuna","tunnel","turkey","turn","turtle",
"twelve","twenty","twice","twin","twist","two","type","typical","ugly","umbrella",
"unable","unaware","uncle","uncover","under","undo","unfair","unfold","unhappy","uniform",
"unique","unit","universe","unknown","unlock","until","unusual","unveil","update","upgrade",
"uphold","upon","upper","upset","urban","urge","usage","use","used","useful",
"useless","usual","utility","vacant","vacuum","vague","valid","valley","valve","van",
"vanish","vapor","various","vast","vault","vehicle","velvet","vendor","venture","venue",
"verb","verify","version","very","vessel","veteran","viable","vibrant","vicious","victory",
"video","view","village","vintage","violin","virtual","virus","visa","visit","visual",
"vital","vivid","vocal","voice","void","volcano","volume","vote","voyage","wage",
"wagon","wait","walk","wall","walnut","want","warfare","warm","warrior","wash",
"wasp","waste","water","wave","way","wealth","weapon","wear","weasel","weather",
"web","wedding","weekend","weird","welcome","west","wet","whale","what","wheat",
"wheel","when","where","whip","whisper","wide","width","wife","wild","will",
"win","window","wine","wing","wink","winner","winter","wire","wisdom","wise",
"wish","witness","wolf","woman","wonder","wood","wool","word","work","world",
"worry","worth","wrap","wreck","wrestle","wrist","write","wrong","yard","year",
"yellow","you","young","youth","zebra","zero","zone","zoo"];

function makeRandomArr(a, b) {
  return Math.random() - 0.5;
}

words.sort(makeRandomArr);

var rand = function(from, to) { 
    var n = Math.floor((to - from + 1) * (Math.random() %100)); 
    return (from + n); 
} 
var newWords = words; 
var loops = (words.length - numWords); 
     
for (var i = 0; i < loops; i++) { 
    newWords.splice(rand(0, words.length - 1), 1); 
} 

var gen24 = newWords.join(' ');


  $("#phrase24").html(gen24);
}


function refreshdiv() {
	$('#addr-container').load(document.URL +  ' #addr-container');
	$("#addr-container").show();
}

function printDiv() {    
  var printContents = document.getElementById('addr-container').innerHTML;
  var originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  }

function rsvs(radio) {
  isHODLing = false;
  switch(radio.value) {
    case 'R':
        $("#addr-spend").hide();
        $("#addr-receive").show();
        break;
    case 'S':
        $("#submit").html("SEND");
        $("#addr-spend").show();
        $("#addr-receive").hide();
        $("#address").val("");
        $("#address").removeAttr("disabled");
        break;
    case 'L':
        $("#submit").html("PLAY");
        $("#addr-spend").show();
        $("#addr-receive").hide();
        $("#address").val("Lottery");
        $("#address").attr("disabled", "disabled");
        break;
    case 'H':
        isHODLing = true;
        $("#submit").html("HODL");
        $("#addr-spend").show();
        $("#addr-receive").hide();
        $("#address").attr("disabled", "disabled");

        var nMonths = 0;
        while(nMonths < 1 || nMonths > 12) {
          nMonths = prompt("Enter the number of months to HODL(1-12): ");
          if(nMonths == null) {
             iHODLing = false;
             $("#mainR").click();
             setTimeout( function() {
                $('#mainH').removeClass("active");
             }, 10);
             break;
          }

          if(nMonths && nMonths >=1 && nMonths <= 12) {
             const APR = 100 * hodlBestRate * (1 - ((12-nMonths)*0.07));
             const FINAL = nMonths * APR / 12;
             hodlRate = FINAL;
             $("#address").val("HODL"+nMonths + " {APR: " + APR.toFixed(2) + "%, F: +" + FINAL.toFixed(2) + "%}");
          } else { alert("Enter a number between 1-12."); }
        }
        break;
  }
}

function amountChanged(amount) {
  if(!isHODLing) return;
  const a = Number(amount);
  var fAmount = a + (a*hodlRate)/100; fAmount *= 0.999;
  var FINAL = fAmount.toFixed(2);
  if (amount == "") { FINAL = hodlRate.toFixed(2) + "%" }
  var newVal = $("#address").val().split(",")[0] + ", F: " + FINAL + "}";
  $("#address").val(newVal);
}

var tx; // global variable for the transaction

function spendf() {
  var amount = Number($("#amount").val());
  const FEE =  PARAMS[CURRENT_COIN].donationAmount;
  if(balance < FEE || SWIFT(amount+FEE) > balance) { alert("Insufficient funds! Minimum network fee is " + FEE + " " + CURRENT_COIN + "."); return; }

  // Validate the address
  var address = $("#address").val();
  try {
     PARAMS[CURRENT_COIN].coinjs.address.toOutputScript($("#address").val(), PARAMS[CURRENT_COIN].network);
  } catch(e) {
     console.log(e);
     alert("Please enter a valid address!"); return;
     }
  pubKeyHash = keyPair.hash160(keyPair.getPublicKeyBuffer())
  redeemScript = keyPair.witnessPubKeyHash_output_encode(pubKeyHash)


  // Disable the elements in the form
  $('#address').prop("disabled", true);
  $('#amount').prop("disabled", true);
  $('#submit').prop("disabled", true);
  $('#sendprogress').show();

  // Create the transaction
  tx = new PARAMS[CURRENT_COIN].coinjs.TransactionBuilder(PARAMS[CURRENT_COIN].network);

  // Add all the available input(s)
  for(i in utxos) {
     tx.addInput(utxos[i][PARAMS[CURRENT_COIN].unspentTxid], utxos[i][PARAMS[CURRENT_COIN].unspentOutput]);
  }
  // Add the output
  tx.addOutput($("#address").val(), Math.ceil(amount*100000000));


  // Add the change (if any)
  var change = SWIFT(balance - amount - FEE);
  if (change > 0) {
    tx.addOutput(changeAddress, Math.ceil(change*100000000));
  }

  // Add the donation output (if any)
  if (PARAMS[CURRENT_COIN].donationAmount > 0) {
    tx.addOutput(PARAMS[CURRENT_COIN].donation, Math.ceil((PARAMS[CURRENT_COIN].donationAmount-PARAMS[CURRENT_COIN].txFee)*100000000));
  }

  // Sign all the inputs
  for (i=0; i<utxos.length; i++) {
    tx.sign(i, keyPair, redeemScript, null, Math.ceil(balance*100000000));
  }
  sendtxhex = PARAMS[CURRENT_COIN].sendTxHex
  $.ajax({
    url: PARAMS[CURRENT_COIN].sendApi,
    type: "POST",
    dataType: "json",
    data: JSON.stringify({ rawTx: tx.build().toHex() }),
    contentType: "application/json; charset=utf-8",
    success: function (result) {
	var T1 = PARAMS[CURRENT_COIN].sendTxid1;
	var T2 = PARAMS[CURRENT_COIN].sendTxid2;
	var txid = '';

	if(T1 && T2 && result && result[T1]) txid = result[T1][T2];
	else if(T1 && result) txid = result[T1];

	if (txid && (typeof txid === 'string' || txid instanceof String)) {
	   USD = false;
	   usdBalance = false;
	   if(change > 0 && ( changeAddress == keyPair.getAddress() )) {
		var p1 = PARAMS[CURRENT_COIN].unspentTxid;
		var p2 = PARAMS[CURRENT_COIN].unspentOutput;
		var p3 = PARAMS[CURRENT_COIN].unspentValue;
		utxos = [{[p1]: txid, [p2]: 1, [p3]: change*PARAMS[CURRENT_COIN].unspentDivision}];
		balance = change;
	   } else { utxos = []; balance = 0; }

	   $('#addr-balance').html("Balance: " + balance.toFixed(PARAMS[CURRENT_COIN].precision) + " " + CURRENT_COIN);
           setTimeout( function() {
	      window.open(PARAMS[CURRENT_COIN].explorer + "tx/" + txid);
           }, 1000);
           alert("Transaction was broadcasted successfully!");
	} else {
	   alert("Broadcast failed! Check debug console for details!");
	}

	$('#address').prop("disabled", false).val("");
	$('#amount').prop("disabled", false).val("");
	$('#submit').prop("disabled", false).html("SEND");
	$('#sendprogress').hide();
    },
    error: function (error) {
        $('#address').prop("disabled", false).val("");
        $('#amount').prop("disabled", false).val("");
        $('#submit').prop("disabled", false).html("SEND");
        $('#sendprogress').hide();
	alert("Broadcast failed! Check console for the details!");
    }
  });
  }

function sendProgress(status) {
  var btnText = $("#submit").html();

  if(status=="sending") {
    if(!btnText.endsWith("!")) btnText += ".";
    if(btnText.endsWith("......")) btnText = "SEND";
    $("#submit").html(btnText);
    setTimeout(sendProgress, 1000, status);
  } else {
    $("#submit").html(status);
    setTimeout(enableSendForm, 1000);
  }
}

function enableSendForm() {
  $('#address').prop("disabled", false).val("");
  $('#amount').prop("disabled", false).val("");
  $('#submit').prop("disabled", false).html("SEND");
}

function SWIFT(a) {
  return Number(a.toFixed(8));
}

function accept() {
  Cookies.set('termsAccepted', '1');
}

function copyWholeBalance() {
  const FEE = PARAMS[CURRENT_COIN].donationAmount;
  if(balance - FEE > 0) {
     $('#amount').val(SWIFT(balance - FEE));
     amountChanged(balance - FEE);
  }
}

jQuery(document).ready(function() {
  // PWA Service Worker
  //if ('serviceWorker' in navigator) {
    //navigator.serviceWorker.register('../service-worker.js').catch(function(err) {
//      console.log(err);
//    });
//  }

  // Warning
  //if (Cookies.get('termsAccepted') == null){
  //$('#modalWarning').modal('show');
  //}


  // Copying to clipboard - Tooltip
  $('.clipboard').tooltip({
    trigger: 'click',
    placement: 'bottom'
  });

  function setTooltip(message) {
    $('.clipboard')
      .attr('data-original-title', message)
      .tooltip('show');
  }

  function hideTooltip() {
    setTimeout(function() {
      $('.clipboard').tooltip('hide');
    }, 1000);
  }

  // Clipboard
  var clipboard = new ClipboardJS('.clipboard');

  clipboard.on('success', function(e) {
    setTooltip('Copied!');
    hideTooltip();
  });

  clipboard.on('error', function(e) {
    setTooltip('Failed!');
    hideTooltip();
  });

  "use strict";
  var options = {};
  options.ui = {
    container: "#pwd-container",
    showVerdictsInsideProgressBar: true,
    viewports: {
      progress: ".pwstrength_viewport_progress",
      errors: ".pwstrength_viewport_errors"
    }
  };
  options.common = {
    debug: false,
    onLoad: function() {
      $('#messages').text('Start typing password');
    }
  };
  $(':password').pwstrength(options);
});


(function (jQuery) {
// Source: src/rules.js




var rulesEngine = {};

try {
    if (!jQuery && module && module.exports) {
        var jQuery = require("jquery"),
            jsdom = require("jsdom").jsdom;
        jQuery = jQuery(jsdom().parentWindow);
    }
} catch (ignore) {}

(function ($, rulesEngine) {
    "use strict";
    var validation = {};

    rulesEngine.forbiddenSequences = [
        "0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl",
        "zxcvbnm", "!@#$%^&*()_+"
    ];

    validation.wordNotEmail = function (options, word, score) {
        if (word.match(/^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i)) {
            return score;
        }
        return 0;
    };

    validation.wordLength = function (options, word, score) {
        var wordlen = word.length,
            lenScore = Math.pow(wordlen, options.rules.raisePower);
        if (wordlen < options.common.minChar) {
            lenScore = (lenScore + score);
        }
        return lenScore;
    };

    validation.wordSimilarToUsername = function (options, word, score) {
        var username = $(options.common.usernameField).val();
        if (username && word.toLowerCase().match(username.toLowerCase())) {
            return score;
        }
        return 0;
    };

    validation.wordTwoCharacterClasses = function (options, word, score) {
        if (word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) ||
                (word.match(/([a-zA-Z])/) && word.match(/([0-9])/)) ||
                (word.match(/(.[!,@,#,$,%,\^,&,*,?,_,~])/) && word.match(/[a-zA-Z0-9_]/))) {
            return score;
        }
        return 0;
    };

    validation.wordRepetitions = function (options, word, score) {
        if (word.match(/(.)\1\1/)) { return score; }
        return 0;
    };

    validation.wordSequences = function (options, word, score) {
        var found = false,
            j;
        if (word.length > 2) {
            $.each(rulesEngine.forbiddenSequences, function (idx, seq) {
                var sequences = [seq, seq.split('').reverse().join('')];
                $.each(sequences, function (idx, sequence) {
                    for (j = 0; j < (word.length - 2); j += 1) { // iterate the word trough a sliding window of size 3:
                        if (sequence.indexOf(word.toLowerCase().substring(j, j + 3)) > -1) {
                            found = true;
                        }
                    }
                });
            });
            if (found) { return score; }
        }
        return 0;
    };

    validation.wordLowercase = function (options, word, score) {
        return word.match(/[a-z]/) && score;
    };

    validation.wordUppercase = function (options, word, score) {
        return word.match(/[A-Z]/) && score;
    };

    validation.wordOneNumber = function (options, word, score) {
        return word.match(/\d+/) && score;
    };

    validation.wordThreeNumbers = function (options, word, score) {
        return word.match(/(.*[0-9].*[0-9].*[0-9])/) && score;
    };

    validation.wordOneSpecialChar = function (options, word, score) {
        return word.match(/.[!,@,#,$,%,\^,&,*,?,_,~]/) && score;
    };

    validation.wordTwoSpecialChar = function (options, word, score) {
        return word.match(/(.*[!,@,#,$,%,\^,&,*,?,_,~].*[!,@,#,$,%,\^,&,*,?,_,~])/) && score;
    };

    validation.wordUpperLowerCombo = function (options, word, score) {
        return word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) && score;
    };

    validation.wordLetterNumberCombo = function (options, word, score) {
        return word.match(/([a-zA-Z])/) && word.match(/([0-9])/) && score;
    };

    validation.wordLetterNumberCharCombo = function (options, word, score) {
        return word.match(/([a-zA-Z0-9].*[!,@,#,$,%,\^,&,*,?,_,~])|([!,@,#,$,%,\^,&,*,?,_,~].*[a-zA-Z0-9])/) && score;
    };

    rulesEngine.validation = validation;

    rulesEngine.executeRules = function (options, word) {
        var totalScore = 0;

        $.each(options.rules.activated, function (rule, active) {
            if (active) {
                var score = options.rules.scores[rule],
                    funct = rulesEngine.validation[rule],
                    result,
                    errorMessage;

                if (!$.isFunction(funct)) {
                    funct = options.rules.extra[rule];
                }

                if ($.isFunction(funct)) {
                    result = funct(options, word, score);
                    if (result) {
                        totalScore += result;
                    }
                    if (result < 0 || (!$.isNumeric(result) && !result)) {
                        errorMessage = options.ui.spanError(options, rule);
                        if (errorMessage.length > 0) {
                            options.instances.errors.push(errorMessage);
                        }
                    }
                }
            }
        });

        return totalScore;
    };
}(jQuery, rulesEngine));

try {
    if (module && module.exports) {
        module.exports = rulesEngine;
    }
} catch (ignore) {}

// Source: src/options.js




var defaultOptions = {};

defaultOptions.common = {};
defaultOptions.common.minChar = 6;
defaultOptions.common.usernameField = "#username";
defaultOptions.common.userInputs = [
    // Selectors for input fields with user input
];
defaultOptions.common.onLoad = undefined;
defaultOptions.common.onKeyUp = undefined;
defaultOptions.common.zxcvbn = false;
defaultOptions.common.debug = false;

defaultOptions.rules = {};
defaultOptions.rules.extra = {};
defaultOptions.rules.scores = {
    wordNotEmail: -100,
    wordLength: -50,
    wordSimilarToUsername: -100,
    wordSequences: -50,
    wordTwoCharacterClasses: 2,
    wordRepetitions: -25,
    wordLowercase: 1,
    wordUppercase: 3,
    wordOneNumber: 3,
    wordThreeNumbers: 5,
    wordOneSpecialChar: 3,
    wordTwoSpecialChar: 5,
    wordUpperLowerCombo: 2,
    wordLetterNumberCombo: 2,
    wordLetterNumberCharCombo: 2
};
defaultOptions.rules.activated = {
    wordNotEmail: true,
    wordLength: true,
    wordSimilarToUsername: true,
    wordSequences: false,
    wordTwoCharacterClasses: false,
    wordRepetitions: false,
    wordLowercase: true,
    wordUppercase: true,
    wordOneNumber: true,
    wordThreeNumbers: true,
    wordOneSpecialChar: true,
    wordTwoSpecialChar: true,
    wordUpperLowerCombo: true,
    wordLetterNumberCombo: true,
    wordLetterNumberCharCombo: true
};
defaultOptions.rules.raisePower = 1.4;

defaultOptions.ui = {};
defaultOptions.ui.bootstrap2 = false;
defaultOptions.ui.showProgressBar = true;
defaultOptions.ui.showPopover = false;
defaultOptions.ui.showStatus = false;
defaultOptions.ui.spanError = function (options, key) {
    "use strict";
    var text = options.ui.errorMessages[key];
    if (!text) { return ''; }
    return '<span style="color: #d52929">' + text + '</span>';
};
defaultOptions.ui.popoverError = function (errors) {
    "use strict";
    var message = "<div>Errors:<ul class='error-list' style='margin-bottom: 0;'>";

    jQuery.each(errors, function (idx, err) {
        message += "<li>" + err + "</li>";
    });
    message += "</ul></div>";
    return message;
};
defaultOptions.ui.errorMessages = {
    wordLength: "Your password is too short",
    wordNotEmail: "Do not use your nickname as your password",
    wordSimilarToUsername: "Your password cannot contain your username",
    wordTwoCharacterClasses: "Use different character classes",
    wordRepetitions: "Too many repetitions",
    wordSequences: "Your password contains sequences"
};
defaultOptions.ui.verdicts = ["Weak", "Normal", "Medium", "Strong", "Very Strong"];
defaultOptions.ui.showVerdicts = true;
defaultOptions.ui.showVerdictsInsideProgressBar = false;
defaultOptions.ui.showErrors = true;
defaultOptions.ui.container = undefined;
defaultOptions.ui.viewports = {
    progress: undefined,
    verdict: undefined,
    errors: undefined
};
defaultOptions.ui.scores = [14, 26, 38, 50];

// Source: src/ui.js




var ui = {};

(function ($, ui) {
    "use strict";

    var barClasses = ["danger", "warning", "success"],
        statusClasses = ["error", "warning", "success"];

    ui.getContainer = function (options, $el) {
        var $container;

        $container = $(options.ui.container);
        if (!($container && $container.length === 1)) {
            $container = $el.parent();
        }
        return $container;
    };

    ui.findElement = function ($container, viewport, cssSelector) {
        if (viewport) {
            return $container.find(viewport).find(cssSelector);
        }
        return $container.find(cssSelector);
    };

    ui.getUIElements = function (options, $el) {
        var $container, result;

        if (options.instances.viewports) {
            return options.instances.viewports;
        }

        $container = ui.getContainer(options, $el);

        result = {};
        result.$progressbar = ui.findElement($container, options.ui.viewports.progress, "div.progress");
        if (options.ui.showVerdictsInsideProgressBar) {
            result.$verdict = result.$progressbar.find("span.password-verdict");
        }

        if (!options.ui.showPopover) {
            if (!options.ui.showVerdictsInsideProgressBar) {
                result.$verdict = ui.findElement($container, options.ui.viewports.verdict, "span.password-verdict");
            }
            result.$errors = ui.findElement($container, options.ui.viewports.errors, "ul.error-list");
        }

        options.instances.viewports = result;
        return result;
    };

    ui.initProgressBar = function (options, $el) {
        var $container = ui.getContainer(options, $el),
            progressbar = "<div class='progress'><div class='";

        if (!options.ui.bootstrap2) {
            progressbar += "progress-";
        }
        progressbar += "bar'>";
        if (options.ui.showVerdictsInsideProgressBar) {
            progressbar += "<span class='password-verdict'></span>";
        }
        progressbar += "</div></div>";

        if (options.ui.viewports.progress) {
            $container.find(options.ui.viewports.progress).append(progressbar);
        } else {
            $(progressbar).insertAfter($el);
        }
    };

    ui.initHelper = function (options, $el, html, viewport) {
        var $container = ui.getContainer(options, $el);
        if (viewport) {
            $container.find(viewport).append(html);
        } else {
            $(html).insertAfter($el);
        }
    };

    ui.initVerdict = function (options, $el) {
        ui.initHelper(options, $el, "<span class='password-verdict'></span>",
                        options.ui.viewports.verdict);
    };

    ui.initErrorList = function (options, $el) {
        ui.initHelper(options, $el, "<ul class='error-list'></ul>",
                        options.ui.viewports.errors);
    };

    ui.initPopover = function (options, $el) {
        $el.popover("destroy");
        $el.popover({
            html: true,
            placement: "bottom",
            trigger: "manual",
            content: " "
        });
    };

    ui.initUI = function (options, $el) {
        if (options.ui.showPopover) {
            ui.initPopover(options, $el);
        } else {
            if (options.ui.showErrors) { ui.initErrorList(options, $el); }
            if (options.ui.showVerdicts && !options.ui.showVerdictsInsideProgressBar) {
                ui.initVerdict(options, $el);
            }
        }
        if (options.ui.showProgressBar) {
            ui.initProgressBar(options, $el);
        }
    };

    ui.possibleProgressBarClasses = ["danger", "warning", "success"];

    ui.updateProgressBar = function (options, $el, cssClass, percentage) {
        var $progressbar = ui.getUIElements(options, $el).$progressbar,
            $bar = $progressbar.find(".progress-bar"),
            cssPrefix = "progress-";

        if (options.ui.bootstrap2) {
            $bar = $progressbar.find(".bar");
            cssPrefix = "";
        }

        $.each(ui.possibleProgressBarClasses, function (idx, value) {
            $bar.removeClass(cssPrefix + "bar-" + value);
        });
        $bar.addClass(cssPrefix + "bar-" + barClasses[cssClass]);
        $bar.css("width", percentage + '%');
    };

    ui.updateVerdict = function (options, $el, text) {
        var $verdict = ui.getUIElements(options, $el).$verdict;
        $verdict.text(text);
    };

    ui.updateErrors = function (options, $el) {
        var $errors = ui.getUIElements(options, $el).$errors,
            html = "";
        $.each(options.instances.errors, function (idx, err) {
            html += "<li>" + err + "</li>";
        });
        $errors.html(html);
    };

    ui.updatePopover = function (options, $el, verdictText) {
        var popover = $el.data("bs.popover"),
            html = "",
            hide = true;

        if (options.ui.showVerdicts &&
                !options.ui.showVerdictsInsideProgressBar &&
                verdictText.length > 0) {
            html = "<h5><span class='password-verdict'>" + verdictText +
                "</span></h5>";
            hide = false;
        }
        if (options.ui.showErrors) {
            if (options.instances.errors.length > 0) {
                hide = false;
            }
            html += options.ui.popoverError(options.instances.errors);
        }

        if (hide) {
            $el.popover("hide");
            return;
        }

        if (options.ui.bootstrap2) { popover = $el.data("popover"); }

        if (popover.$arrow && popover.$arrow.parents("body").length > 0) {
            $el.find("+ .popover .popover-content").html(html);
        } else {
            // It's hidden
            popover.options.content = html;
            $el.popover("show");
        }
    };

    ui.updateFieldStatus = function (options, $el, cssClass) {
        var targetClass = options.ui.bootstrap2 ? ".control-group" : ".form-group",
            $container = $el.parents(targetClass).first();

        $.each(statusClasses, function (idx, css) {
            if (!options.ui.bootstrap2) { css = "has-" + css; }
            $container.removeClass(css);
        });

        cssClass = statusClasses[cssClass];
        if (!options.ui.bootstrap2) { cssClass = "has-" + cssClass; }
        $container.addClass(cssClass);
    };

    ui.percentage = function (score, maximun) {
        var result = Math.floor(100 * score / maximun);
        result = result < 0 ? 0 : result;
        result = result > 100 ? 100 : result;
        return result;
    };

    ui.getVerdictAndCssClass = function (options, score) {
        var cssClass, verdictText, level;

        if (score <= 0) {
            cssClass = 0;
            level = -1;
            verdictText = options.ui.verdicts[0];
        } else if (score < options.ui.scores[0]) {
            cssClass = 0;
            level = 0;
            verdictText = options.ui.verdicts[0];
        } else if (score < options.ui.scores[1]) {
            cssClass = 0;
            level = 1;
            verdictText = options.ui.verdicts[1];
        } else if (score < options.ui.scores[2]) {
            cssClass = 1;
            level = 2;
            verdictText = options.ui.verdicts[2];
        } else if (score < options.ui.scores[3]) {
            cssClass = 1;
            level = 3;
            verdictText = options.ui.verdicts[3];
        } else {
            cssClass = 2;
            level = 4;
            verdictText = options.ui.verdicts[4];
        }

        return [verdictText, cssClass, level];
    };

    ui.updateUI = function (options, $el, score) {
        var cssClass, barPercentage, verdictText;

        cssClass = ui.getVerdictAndCssClass(options, score);
        verdictText = cssClass[0];
        cssClass = cssClass[1];

        if (options.ui.showProgressBar) {
            barPercentage = ui.percentage(score, options.ui.scores[3]);
            ui.updateProgressBar(options, $el, cssClass, barPercentage);
            if (options.ui.showVerdictsInsideProgressBar) {
                ui.updateVerdict(options, $el, verdictText);
            }
        }

        if (options.ui.showStatus) {
            ui.updateFieldStatus(options, $el, cssClass);
        }

        if (options.ui.showPopover) {
            ui.updatePopover(options, $el, verdictText);
        } else {
            if (options.ui.showVerdicts && !options.ui.showVerdictsInsideProgressBar) {
                ui.updateVerdict(options, $el, verdictText);
            }
            if (options.ui.showErrors) {
                ui.updateErrors(options, $el);
            }
        }
    };
}(jQuery, ui));

// Source: src/methods.js




var methods = {};

(function ($, methods) {
    "use strict";
    var onKeyUp, applyToAll;

    onKeyUp = function (event) {
        var $el = $(event.target),
            options = $el.data("pwstrength-bootstrap"),
            word = $el.val(),
            userInputs,
            verdictText,
            verdictLevel,
            score;

        if (options === undefined) { return; }

        options.instances.errors = [];
        if (options.common.zxcvbn) {
            userInputs = [];
            $.each(options.common.userInputs, function (idx, selector) {
                userInputs.push($(selector).val());
            });
            userInputs.push($(options.common.usernameField).val());
            score = zxcvbn(word, userInputs).entropy;
        } else {
            score = rulesEngine.executeRules(options, word);
        }
        ui.updateUI(options, $el, score);
        verdictText = ui.getVerdictAndCssClass(options, score);
        verdictLevel = verdictText[2];
        verdictText = verdictText[0];

        if (options.common.debug) { console.log(score + ' - ' + verdictText); }

        if ($.isFunction(options.common.onKeyUp)) {
            options.common.onKeyUp(event, {
                score: score,
                verdictText: verdictText,
                verdictLevel: verdictLevel
            });
        }
    };

    methods.init = function (settings) {
        this.each(function (idx, el) {
            // Make it deep extend (first param) so it extends too the
            // rules and other inside objects
            var clonedDefaults = $.extend(true, {}, defaultOptions),
                localOptions = $.extend(true, clonedDefaults, settings),
                $el = $(el);

            localOptions.instances = {};
            $el.data("pwstrength-bootstrap", localOptions);
            $el.on("keyup", onKeyUp);
            $el.on("change", onKeyUp);
            $el.on("onpaste", onKeyUp);

            ui.initUI(localOptions, $el);
            if ($.trim($el.val())) { // Not empty, calculate the strength
                $el.trigger("keyup");
            }

            if ($.isFunction(localOptions.common.onLoad)) {
                localOptions.common.onLoad();
            }
        });

        return this;
    };

    methods.destroy = function () {
        this.each(function (idx, el) {
            var $el = $(el),
                options = $el.data("pwstrength-bootstrap"),
                elements = ui.getUIElements(options, $el);
            elements.$progressbar.remove();
            elements.$verdict.remove();
            elements.$errors.remove();
            $el.removeData("pwstrength-bootstrap");
        });
    };

    methods.forceUpdate = function () {
        this.each(function (idx, el) {
            var event = { target: el };
            onKeyUp(event);
        });
    };

    methods.addRule = function (name, method, score, active) {
        this.each(function (idx, el) {
            var options = $(el).data("pwstrength-bootstrap");

            options.rules.activated[name] = active;
            options.rules.scores[name] = score;
            options.rules.extra[name] = method;
        });
    };

    applyToAll = function (rule, prop, value) {
        this.each(function (idx, el) {
            $(el).data("pwstrength-bootstrap").rules[prop][rule] = value;
        });
    };

    methods.changeScore = function (rule, score) {
        applyToAll.call(this, rule, "scores", score);
    };

    methods.ruleActive = function (rule, active) {
        applyToAll.call(this, rule, "activated", active);
    };

    $.fn.pwstrength = function (method) {
        var result;

        if (methods[method]) {
            result = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            result = methods.init.apply(this, arguments);
        } else {
            $.error("Method " +  method + " does not exist on jQuery.pwstrength-bootstrap");
        }

        return result;
    };
}(jQuery, methods));
}(jQuery));
