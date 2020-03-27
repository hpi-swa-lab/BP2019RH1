# 10.12.19 - Call with Luke

## What we did since last meeting
- meeting and unpacking with Jens and Patrick
    - qualitative research (what is encoding)
- access to data:
- looked at data on server
    - programmed endpoints for data
    - evaluation on server with BP-Workspace
- already ideated on some visulizations
- started reading literature

## Questions regarding data
- What defines the individuals dataset? What defines the messages dataset? What is the difference between the datasets?
- Every messages and individuals object has four "main" keys: Data, Metadata, NestedTracedData and SHA - What is saved in under each of these keys?
- Is one line in the dataset one "trace", i.e. one dataset with "complete" provenance information regarding one response?
- Does one line in a dataset correspond to one in the other? If so, how?
- "unclean" dataset? We found strings with Somali content with the key "age_raw" in individuals? Should they also be replaced? 
- Can anything be in "\_raw" keys? (non fitting data...)
- What do the keys mean? (e.g. "rqas04e01...", "suggestions", "recovered_run", "have_voice" )
   - do you have maybe a code book / documentation, where all encodings are explained?
- What keys encode the "themes"?
- What are the different "id"-fields for, since there are quite a lot of them ("run_id - csap_s02_demog", "recently_displaced_raw_id", ...)
- What do the objects with "MERGED" content mean?


## Next steps
- Schedule call with researcher to talk about her process (at specific example)
- design thinking to approach problem space

## Data Explanations
- Individuals/messages
- One way: not worrying about individuals
- Messages: questions - answers, counting grouped together
- Individuals: more complex, joining answers together to one individual

- Messages grouped to answers, we probably only see answers
- (Radio question and answer 1), we will get the questions asked

- nestedTraceData: historical values
- Data: category, decision
- Metadata: origin information how the decision was made to categorise

- One line one array: performance reasons for pipeline
- We can probably flatten that list together

- Probably one object is one answer

- Look at python code for unpacking data

- Avf core data modules

- Provenance: nestedTraceData
- Do not need to take id’s for links
- Take leaf of data structure

- Theoretically correlating both data sets would work, but is too much unnecessary work
- Contain same data

- Unclean data on purpose

- Schema is public, content only sensitive

- “Research question and answer season 4 episode 1”
- Social accountability

- recovered_run (ssl - sms problems)

- Suggestions: do you have any suggestions -> encoding
- Actual suggestion in text itself is in suggestions_raw_id with sha for message object

- MERGED - no idea

- STOP - person has opted out, we cannot report anything like this

- Have method to export data into excel sheet, because people sometimes rather look at that

- code_id standard network operator codes

- Themes -> code schemes being used and then look up code scheme values
- Scheme-ID

- [x] Look at avf GitHub repo

- Can use python library or reimplement some of that in lively

- nestedTraceData: list of maps, each head level is one 

- have_voice: related to question

- Confidence: 1 -> person, 0 wasn’t applied here

- _ws: data was somewhere else in the scheme

- Districts are pretty big
- Location might not be correct, answers messy because we ask people where they are
- Location id: are they giving us a state, region, district, zone, so on

- First work on concrete visualisations, then ask researcher next year probably (user study), take report, ask them how they came up with report

- Element with empty nestedtracedata and unique string like sha

- [ ] Divergent designs, 20 different for each case
