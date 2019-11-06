_:
	@echo "Usage: make [RULE]"
	@egrep "^[a-z]+:" Makefile | sed 's/:.*//' | sed 's/^/  /'

pdf:
	pdflatex -shell-escape document.tex
	bibtex document
	pdflatex -shell-escape document.tex
	pdflatex -shell-escape document.tex 

fast:
	bibtex document
	pdflatex -shell-escape document.tex

warnings:
	grep "Warning:" document.log

clean:
	rm document.aux  document.bbl  document.dvi document.log  document.out document.markdown.*

view:
	sumatra document.pdf &

sync:
		git pull --no-edit; echo -n "SYNC " > COMMIT ; 
		git status --porcelain | grep -v "??" | tr "\n" ";">> COMMIT; 
		git commit -F COMMIT .; 
		git push 
