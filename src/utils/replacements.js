import { qs } from "./core";
import Url from "./url";

export function replaceBase(doc, section){
	var base;
	var head;
	var url = section.href;
	var absolute = (url.indexOf("://") > -1);

	if(!doc){
		return;
	}

	head = qs(doc, "head");
	base = qs(head, "base");

	if(!base) {
		base = doc.createElement("base");
		head.insertBefore(base, head.firstChild);
	}

	// Fix for Safari crashing if the url doesn't have an origin
	if (!absolute && (typeof(window) !== "undefined" && window.location)) {
		let parts = window.location.href.split("/")
		let directory = "";

		parts.pop();
		directory = parts.join("/");

		url = directory + url;
	}

	base.setAttribute("href", url);
}

export function replaceCanonical(doc, section){
	var head;
	var link;
	var url = section.canonical || section.href;

	if(!doc){
		return;
	}

	head = qs(doc, "head");
	link = qs(head, "link[rel='canonical']");

	if (link) {
		link.setAttribute("href", url);
	} else {
		link = doc.createElement("link");
		link.setAttribute("rel", "canonical");
		link.setAttribute("href", url);
		head.appendChild(link);
	}
}

export function replaceMeta(doc, section){
	var head;
	var meta;
	var id = section.idref || section.href;
	if(!doc){
		return;
	}

	head = qs(doc, "head");
	meta = qs(head, "link[property='dc.identifier']");

	if (meta) {
		meta.setAttribute("content", id);
	} else {
		meta = doc.createElement("meta");
		meta.setAttribute("name", "dc.identifier");
		meta.setAttribute("content", id);
		head.appendChild(meta);
	}
}

// TODO: move me to Contents
export function replaceLinks(contents, fn) {

	var links = contents.querySelectorAll("a[href]");

	if (!links.length) {
		return;
	}

	var base = qs(contents.ownerDocument, "base");
	var location = base ? base.getAttribute("href") : contents.ownerDocument.defaultView.location.href;
	var replaceLink = function(link){
		var href = link.getAttribute("href");

		if(href.indexOf("mailto:") === 0){
			return;
		}

		var absolute = (href.indexOf("://") > -1);
		var linkUrl = new Url(href, location);

		if(absolute){

			link.setAttribute("target", "_blank");

		}else{
			link.onclick = function(){

				if(linkUrl && linkUrl.hash) {
					fn(linkUrl.Path.path + linkUrl.hash);
				} else if(linkUrl){
					fn(linkUrl.Path.path);
				} else {
					fn(href);
				}

				return false;
			};
		}
	}.bind(this);

	for (var i = 0; i < links.length; i++) {
		replaceLink(links[i]);
	}


}

export function substitute(content, urls, replacements) {
	urls.forEach(function(url, i){
		if (url && replacements[i]) {
			content = content.replace(new RegExp(url, "g"), replacements[i]);
		}
	});
	return content;
}
