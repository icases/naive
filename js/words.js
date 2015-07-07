var current_word;
var current_real;
var bien=0;
var mal=0;
var lang='es' ;
translate=false;
dicts={'es':'http://buscon.rae.es/drae/srv/search?val=',
        'en':'http://findwords.info/term/search?query=',
        'de':'http://de.thefreedictionary.com/',
        'it':'http://it.thefreedictionary.com/'} 
langNames={'es':"Castellano",
            'en':"Inglés",
            "ge":"Alemán",
            'it':'Italiano'}
$(function(){	
    getLang()
	load_word();
   
 $('#result').hide()
	$('#bien').text(bien);
	$('#mal').text(mal); 
	
	$('#yes').click(function(){check_reply(1)})
	$('#no').click(function(){check_reply(0)});
	$('#new').click(function(){new_word()});
	$("#toggleList").click(function(){
          $(this).text(function(i, text){
              return text === "Ver Palabras" ? "Ocultar Palabras" : "Ver Palabras";
          })
       });
     $("#restart").click( function(){location.reload()})  
     
     $(document).keyup(function(e){
                      if (e.which == 13){
                          if ($('#new').is(":visible")){ 
                              new_word()
                          }else{
                             check_reply(1);
                          }   
                      } 
                      if (e.which == 8 && $('#no').is(":visible")){   
                            check_reply(0);
                      }
                      if (e.which == 68 ){   
                            $('a.last_def').click();
                      }
                      if (e.which == 84 ){   
                          $('a.last_trans').click();
                      } 
                      if (e.which == 76 ){  
                          $('#toggleList').click();
                      }
                      if (e.which == 82 ){ 
                          $('#restart').click();
                      }
                  });     
        
})  



function getLang(){
    lang=getUrlVar('lang');
    if (lang==''){lang='es'}     
    if (lang!='es'){
        translate=true;
        $('#warn').hide()}   
    $(".langName").text(langNames[lang])
    $(".lang").removeClass('active') 
    $("#"+lang).addClass('active') 
}


function getUrlVar(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && unescape(result[1]) || ""; 
}

function load_word () {
	$('#word').html("Cargando <img src='img/spinner3-bluey.gif' alt='Spinner'>");
	$.getJSON('cgi/gime.cgi',{ lang:lang}, function(data) {
		current_word=data[0].word;
		//alert(current_word);
		current_real=data[0].real;
	  $('#word').html(current_word); 
	  $('#word').quickfit({max:80})
      $('#buttons').show() 
      
	});
	
};
function add_to_list(res){       
    
	
	string='<li class="list-group-item"><span>';
    
	if (current_real==1){
	    $('ul#word_list li a').removeClass("last_def")
        $('ul#word_list li a').removeClass("last_trans")
		string+="<a class='last_def' href='"+encodeURI(dicts[lang]+current_word)+"' target='_blank'>";
	} else{
	   string+="<s>" 
	}
	string+=current_word
	if (current_real==1){
		string+="</a>";
	} else {
	    "</s>"
	}
	string+="</span>";
	if (res=='bien') string+='<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
	if (res=='mal') string+='<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
	string+="</span>";
	if (translate && current_real==1){
	    string+='<a class="pull-right last_trans" target="_blank" href="https://translate.google.es/#'+lang+'/es/'+current_word+'"><img src="img/es.png"></a>'
	}
	string+="</li>";                  
	$(string).prependTo('#word_list')
	$('a.last_trans, a.last_def').click(function(event)
    {
      var link = $(this);
      var target = link.attr("target");

      if($.trim(target).length > 0)
      {
        window.open(link.attr("href"), target);
      }
      else
      {
         window.location = link.attr("href");
      }

      event.preventDefault();
    });
}
function check_reply(res){
	//alert("you said "+res);
	$('#buttons').hide()
	if (res==current_real){    
	    $('#exclama').text("¡Bien!");
		if (current_real==0){
			//alert("Me has pillado. "+current_word+" no es una palabra real");
			$('#mensaje').html("Me has pillado <b class='text-capitalize'>"+current_word+"</b> no es una palabra real");
			
		} else {
			//alert("Efectivemente. "+current_word+"  es una palabra valida");
			$('#mensaje').html("Efectivemente, <b class='text-capitalize'>"+current_word+"</b>  es una palabra valida"); 
		}
		bien++;
		$('#bien').text(bien);
		add_to_list('bien');
	} else {  
	    $('#exclama').text("¡Lo siento!");
		if (current_real==0){
			//alert("Lo siento. "+current_word+" no es una palabra real");
			$('#mensaje').html("Lo siento. <b class='text-capitalize'>"+current_word+"</b> no es una palabra real");
		} else {
			//alert("Lo siento. "+current_word+"  es una palabra valida");
			$('#mensaje').html("Aunque no lo parezca, <b class='text-capitalize'>"+current_word+"</b> no es una palabra real"); 
		}
		mal++;
		$('#mal').text(mal);
		add_to_list('mal');
			
	} 
	
	$('#result').show()
	
	
}
function new_word () {
	$('#result div').hide();
	$('#result').hide();
	load_word();
}
