// Wheel 

var can = document.getElementById('wheel-canvas');
con = can.getContext('2d');

var DRAW_SPEED = 30;
var WHEEL_SPEED = 120;
var offsetLastSet = -1;
var circleDrawLength = 1500;

var score = 0;
var wowText = "Wow!";

var canvasPosition = $(can).offset();
var scrollPos = $(window)[0].scrollY;

var circleCenterX = .715;
var circleCenterY = .445;

var wheelColor_01 = 'rgb(039,083,086)';
var wheelColor_02 = 'rgb(071,130,135)';

function wedge(id, startX, startY, width, height, offset, context, color) {
	this.id = id;
	
	this.context = context;
	this.color = color;
	this.colorWithFlash = '#FFFFFF';
	
	this.setFlash = false;
	this.flashTimer = 0;
	this.flashR = 255;
	this.flashG = 255;
	this.flashB = 255;
	
	this.addR = true;
	this.addG = true;
	this.addB = false;
	
	this.startX = startX;
	this.startY = startY;
	this.width = width;
	this.height = height;
	this.offset = offset;
	
	this.offsetComboTimer = 0;
	
	this.p1 = [startX, startY];
	this.p2 = [startX + width, startY];
	this.p3 = [startX + width - offset, startY + height];
	this.p4 = [startX - offset, startY + height];
}
wedge.prototype.updateme = function() {	
	var red   = this.color.slice(4,7);
	var green = this.color.slice(8,11);
	var blue  = this.color.slice(12,15);
	
	this.addR = setAddOrSubColor(this.addR, red, 75, 150);
	this.addG = setAddOrSubColor(this.addG, green, 125, 200);
	this.addB = setAddOrSubColor(this.addB, blue, 125, 200);
	
	red = updateColor(red, this.addR, 1);
	blue = updateColor(blue, this.addB, 2);
	green = updateColor(green, this.addG, 3);
	
	if(this.setFlash) {
		this.flashTimer = 60;
		this.flashR = 255;
		this.flashG = 255;
		this.flashB = 215;
	}
	
	this.flashR = updateFlashColor(this.flashR, red);
	this.flashG = updateFlashColor(this.flashG, green);
	this.flashB = updateFlashColor(this.flashB, blue);
	
	red = parseNumberToColor(red);
	blue = parseNumberToColor(blue);
	green = parseNumberToColor(green);
	this.color = "rgb("+red+","+green+","+blue+")";	
	
	var flashR = parseNumberToColor(this.flashR);
	var flashG = parseNumberToColor(this.flashG);
	var flashB = parseNumberToColor(this.flashB);
	this.flashColor = "rgb("+flashR+","+flashG+","+flashB+")";
	
	this.p1[0] = this.startX;
	this.p1[1] = this.startY;
	this.offset = timer/WHEEL_SPEED;
	
	if(this.offsetComboTimer < 0){
		if(offsetLastSet == this.id) {
			showWow();
			DRAW_SPEED -= 3;
			clearInterval(drawInterval);			
			drawInterval = setInterval(draw, DRAW_SPEED);
			this.offsetComboTimer = WHEEL_SPEED;			
		}
	}
	
	if(this.flashTimer > 0) {
		this.flashTimer--;
	}
}
wedge.prototype.drawme = function() {	
	this.context.fillStyle = this.color;
	if(this.flashTimer > 0) {
		this.context.fillStyle = this.flashColor;
	}	
	this.context.beginPath();
	this.context.moveTo(this.p1[0], this.p1[1]);
	this.context.arc(this.p1[0], this.p1[1], this.height, this.id*this.width+this.offset, (this.id*this.width)+this.width+this.offset);
	this.context.lineTo(this.p1[0], this.p1[1]);
	if(this.context.isPointInPath(mouseX - canvasPosition.left, mouseY - canvasPosition.top  + scrollPos) == true ) {
		this.setFlash = true;		
		if(offsetLastSet != this.id) {
			offsetLastSet = this.id;
			this.offsetComboTimer = WHEEL_SPEED;
		}
		else {
			this.offsetComboTimer--;
		}
	}
	else {
		this.setFlash = false;
	}
	this.context.closePath();
	this.context.fill();	
}

function showWow() {
	score++;
	if(score < 5 ) {
		wowText = "Nice!";
	}
	else if(score < 10) {
		wowText = "Wow!";
	}
	else if(score < 20) {
		wowText = "OMG!";
	}
	else if(score >= 20) {
		wowText = "WTF?!";
	}
	$("#mainheader").append('<div class="cursive wheel-nice noselect">'+wowText+'</div>');
	setTimeout(removeTempElement, 2300);
	if($('#scoreContainer').length == 0) {
		$("#mainheader").append('<div id="scoreContainer" class="cursive wheel-score noselect">+1</div>');
	}
	else {
		$("#scoreContainer").first().html("+"+score);
	}
}

function removeTempElement() {
	$("#mainheader").find(".wheel-nice").first().remove();
}

function setAddOrSubColor(current, color, min, max) {
	if(parseInt(color) >= max)
		return false;
	else if (parseInt(color) <= min)
		return true;
	return current;
}
	
function parseNumberToColor(color) {
	color = Math.min(color, 255);

	if(color < 10) {
		color = "00" + color.toString();
	}
	else if(color < 100) {
		color = "0" + color.toString();
	}
	else {
		color = color.toString();
	}
	return color;
}

function updateColor(color, add, speed) {
	color = parseInt(color);
	
	if(timer%speed == 0) {
		if(add)
			color++;
		else
			color--;
	}
	return color;
}

function updateFlashColor(flashColor, color) {	
	if(flashColor > 0) {
		flashColor -= 15;
	}
	return Math.max(flashColor, color);
}

var circle = [];
var NUM_WEDGES = 16;
var timer = 0;
createCircle(NUM_WEDGES);
function createCircle(wedges) {
	var shapecolor;
	var centerX = $('#mesh-container').width()*circleCenterX;
	var centerY = $('#mesh-container').height()*circleCenterY;
	
	for(var i = 0; i < wedges ; i++) {
		if(i%2 == 0) {
			shapecolor = wheelColor_01;
		}
		else {
			shapecolor = wheelColor_02;
		}		
		circle[i] = new wedge(i, centerX, centerY, (2*Math.PI)/NUM_WEDGES, circleDrawLength, 50, con, shapecolor);
	}
}

function draw() {
	con.clearRect(0, 0, can.width, can.height);
	for(i = 0; i < NUM_WEDGES ; i++) {
		circle[i].updateme();
		circle[i].drawme();
	}	
	timer++;
}

function resizeCanvas() {
	can.width = $('#mesh-container').width();
	can.height = $('#mesh-container').height();
	canvasPosition = $(can).offset();
	circleDrawLength = can.width;
	for(var i = 0; i < NUM_WEDGES; i++) {
		circle[i].startX = 	can.width*circleCenterX;
		circle[i].startY = 	can.height*circleCenterY;
	}
	
	draw(); 
}

window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

var drawInterval = setInterval(draw, DRAW_SPEED);
var mouseX, mouseY, prevMouseX, prevMouseY;

$('#mainheader').mousemove( function(event) {
	prevMouseX = mouseX;
	prevMouseY = mouseY;
	mouseX = event.clientX;
	mouseY = event.clientY;	
});

// Brain Animation

var bannerTimer = 0;
var brainTimer = 0;
var brianAnimationPlayed = false;
function brainAnimation() {
	if(brainTimer == 0) {
		brianAnimationPlayed = true;
		brainAnimationStartedAt = timer;
		$('#brain').addClass('open');
		$.each($('#circle-group').children(), function(index, value) {
			$(value).css('transition', 'opacity .6s ease-in-out '+((.2*index)+.5).toString()+'s').css('opacity', '1');
		});
	}
	if(brainTimer == 60) {
		$('#brain').css('transition', 'all 1s ease-in-out 1.5s').css('width', '700px').css('left', 'calc( 50% - 350px)').css('opacity', '0');
		$.each($('#circle-group').children().get().reverse(), function(index, value) {
			$(value).css('transition', 'margin-top .9s ease-in-out '+((.2*index)+.7).toString()+'s').css('margin-top', '200px').css('opacity', '0');;
			$(value).css('transition-property', 'opacity, margin-top');
		});
		$.each($('.all-banners').find('.circle'), function(index, value) {
			$(value).css('transition', 'opacity .6s ease-in-out '+((.2*index)+1).toString()+'s').css('opacity', '1');
			$(value).css('transition-property', 'opacity');
		});
	}
	if(brainTimer == 150) {
		$.each($('.all-banners').find('.circle'), function(index, value) {
			$(value).css('transition', 'border .6s ease-in-out 0s');
			//$(value).css('transition-property', 'border');
		});
		$('#brain').css('display','none');
		$('#circle-group').css('display','none');
		$('#about-me-desc').css('transition', 'opacity 1s ease-in-out 0s').css('opacity', '1');
	}
	if(brainTimer > 190) {
		$('.speech-border').css('opacity', '1');
		if(scrollPos > 795) {
			$('#banner1').addClass('opened');
			if(bannerTimer == 0 ) {
				bannerTimer = brainTimer;
			}
		}
		if(bannerTimer > 0) {
			if(brainTimer - 5 > bannerTimer){
				$('#banner2').addClass('opened');
			}
			if(brainTimer - 10 > bannerTimer){
				$('#banner3').addClass('opened');
			}
		}
	}
	brainTimer++;
}


// Scrolls
window.onscroll = function() {
	scrollPos = this.scrollY;
	//clearScrollQueue();
	if(brianAnimationPlayed == false) { 
		if(scrollPos > 550) {
			brianAnimationPlayed = true;
			setInterval(brainAnimation, 30);			
		}
	}
	if(scrollPos > $('#mainheader').height() ){
		$('#scroll-to-top').addClass('visible-fade');
	}else {
		$('#scroll-to-top').removeClass('visible-fade');
	}
};

// Hovers
$('#about-me-img').hover( function() {
		$(this).find('img').addClass('pull');
		$(this).find('img').removeClass('release');
	}, function() {
		$(this).find('img').addClass('release');
		$(this).find('img').removeClass('pull');
   }
);
$('.email-me, .resume-me').hover(
	function() { $(this).find('svg').toggleClass('icon-hover'); },
	function() { $(this).find('svg').toggleClass('icon-hover'); }
);
var myList = $('#recent-work-wrapper').find('.work-grid');
myList.on('mouseover', '.work-grid-element', function() {
	$(this).siblings().removeClass('open');
	$(this).addClass('open');
});

function clearScrollQueue() {
	$('html, body').stop();
}

// Clicks
$('a[href="#me"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('#me').offset().top}, 1600, clearScrollQueue);
});
$('a[href="#recent-work"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('#recent-work-wrapper').offset().top}, 1600, clearScrollQueue);
});
$('a[href="#workbench"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('#workshop-wrapper').offset().top}, 1600, clearScrollQueue);
});
$('a[href="#blog"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('#blog-wrapper').offset().top}, 1600, clearScrollQueue);
});
$('a[href="#contact"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('#contact').offset().top}, 1600, clearScrollQueue);
});
$('.banner-container').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:$('.banner-container').offset().top}, 1600, clearScrollQueue);
});
$('a[href="#top"]').click(function(e){
	e.preventDefault();
	$('html, body').animate({scrollTop:0}, 1600, clearScrollQueue);
});

$('#mc-embedded-subscribe').click(function(e){
	e.preventDefault();
	var myEmail = "brombropaul@gmail.com";
	var mySubject = "Hey Paul!";
	//var email = $('#mce-EMAIL').val();
	var name = $('#mce-NAME').val();
	var message = $('#mce-MESSAGE').val();
	window.open('mailto:'+myEmail+'?subject='+mySubject+'&body='+message+'\n\n- '+name);
});

// Rolling Boxes

var myBoxContainer =      $('.rolling-square-container');
var leftBox =             $('#rolling-square-left');
var rightBox =            $('#rolling-square-right');
var rollDownRight =            "roll-down-right";
var rollDownLeft =            "roll-down-left";
var rollUpRight =              "roll-up-right";
var rollUpLeft =              "roll-up-left";
var leftTopSpacer =      -20;
var leftBottomSpacer =    30;
var rightTopSpacer =     -20;
var rightBottomSpacer =   30;

function addRollDownToLeft() {
	leftBox.addClass(rollDownLeft);
}
function addRollDownToRight() {
	rightBox.addClass(rollDownRight);
}
function addRollUpToLeft () {
	leftBox.addClass(rollUpLeft);
}
function addRollUpToRight () {
	rightBox.addClass(rollUpRight);
}

addRollDownToLeft();
leftBox.on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
	if(leftBox.hasClass(rollDownLeft)) {
		leftBox.removeClass(rollDownLeft);
		if(parseInt(leftTopSpacer) > myBoxContainer.height()-60) {
			leftTopSpacer = -20;
			leftBottomSpacer = 30;
			leftBox.css('top', "auto");
			leftBox.css('bottom', leftBottomSpacer.toString() + "px");
			setTimeout(addRollUpToLeft, 1);
		}else {
			leftTopSpacer = parseInt(leftTopSpacer) + 20;
			leftBox.css('top', leftTopSpacer.toString() + "px");
			setTimeout(addRollDownToLeft, 1);
		}
	}
	else if(leftBox.hasClass(rollUpLeft)) {
		leftBox.removeClass(rollUpLeft);
		if(parseInt(leftBottomSpacer) > myBoxContainer.height()-60) {
			leftTopSpacer = -20;
			leftBottomSpacer = 30;
			leftBox.css('bottom', "auto");
			leftBox.css('top', leftTopSpacer.toString() + "px");
			setTimeout(addRollDownToLeft, 1);
		}else {
			leftBottomSpacer = parseInt(leftBottomSpacer) + 20;
			leftBox.css('bottom', leftBottomSpacer.toString() + "px");
			setTimeout(addRollUpToLeft, 1);
		}
	}
});

addRollUpToRight();
rightBox.on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
	if(rightBox.hasClass(rollDownRight)) {
		rightBox.removeClass(rollDownRight);
		if(parseInt(rightTopSpacer) > myBoxContainer.height()-40) {
			rightTopSpacer = -20;
			rightBottomSpacer = 20;
			rightBox.css('top', "auto");
			rightBox.css('bottom', rightBottomSpacer.toString() + "px");
			setTimeout(addRollUpToRight, 1);
		}else {
			rightTopSpacer = parseInt(rightTopSpacer) + 10;
			rightBox.css('top', rightTopSpacer.toString() + "px");
			setTimeout(addRollDownToRight, 1);
		}
	}
	else if(rightBox.hasClass(rollUpRight)) {
		rightBox.removeClass(rollUpRight);
		if(parseInt(rightBottomSpacer) > myBoxContainer.height()) {
			rightTopSpacer = -20;
			rightBottomSpacer = 20;
			rightBox.css('bottom', "auto");
			rightBox.css('top', rightTopSpacer.toString() + "px");
			setTimeout(addRollDownToRight, 1);
		}else {
			rightBottomSpacer = parseInt(rightBottomSpacer) + 10;
			rightBox.css('bottom', rightBottomSpacer.toString() + "px");
			setTimeout(addRollUpToRight, 1);
		}
	}
});