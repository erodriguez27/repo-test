import sys
import json
import pulp
import numpy as np
from datetime import date


pjson_demanda = sys.argv[1]

'''pjson_demanda ={
  "demand": [
    100809, 100809, 100809, 100809, 102731,
    104172, 104172, 104172, 103211, 100809,
    100809, 100809, 100809, 100809, 100809,
    100809, 100809, 102250, 104172, 104172,
    104172, 103692, 100809, 100809, 100809,
    100809, 103211, 104172, 104172, 104172,
    102731, 100809, 100809, 100809, 100809,
    100809, 100809, 100809, 100809, 106981,
    111610, 111610
  ],
  "posture": [
     0.2, 2.28, 4.51, 5.38, 5.68, 5.75,
    5.77, 5.69, 5.68, 5.64, 5.59, 5.51,
    5.47, 5.42, 5.33, 5.28, 5.23, 5.13,
    5.03, 4.95, 4.89, 4.82, 4.73, 4.62,
    4.51, 4.46, 4.37, 4.29,  4.2, 4.12,
    3.95, 3.89,  3.8,  3.7, 3.62, 3.53,
    3.42, 3.09
  ],
  "previous": [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1000
  ],
  "fecha": [
    '10/6/2020',   '9/4/2020',   '16/4/2020',
    '23/4/2020',  '30/4/2020',  '6/5/2020',
    '13/5/2020',  '20/5/2020',  '27/5/2020',
    '4/6/2020',   '11/6/2020',  '18/6/2020',
    '25/6/2020',  '1/7/2020',   '8/7/2020',
    '15/7/2020',  '22/7/2020',  '29/7/2020',
    '6/8/2020',   '13/8/2020',  '20/8/2020',
    '27/8/2020',  '3/9/2020',   '10/9/2020',
    '17/9/2020',  '24/9/2020',  '1/10/2020',
    '7/10/2020',  '14/10/2020', '21/10/2020',
    '28/10/2020', '5/11/2020',  '12/11/2020',
    '19/11/2020', '26/11/2020', '2/12/2020',
    '9/12/2020',  '16/12/2020', '23/12/2020',
    '30/12/2020', '7/1/2021',   '14/1/2021'
  ],
  "lower_bound": 2000,
  "upper_bound": 20000,
  "algoritm": 'Con alojamiento',
  "diference": 2,
  "optimizer": '2'
}

pjson_demanda= json.dumps(pjson_demanda)'''
jdemanda = json.loads(pjson_demanda)
u = jdemanda["upper_bound"]
l = jdemanda["lower_bound"]
problem = pulp.LpProblem("Minimicing")
indexes = np.arange(len(jdemanda["demand"])).tolist()
previos = jdemanda["previous"]
lot_size = np.array(pulp.LpVariable.matrix(name="x", indexs=indexes,lowBound=0, cat=pulp.LpInteger))
binary_lot_size = np.array(pulp.LpVariable.matrix(name="xz", indexs=indexes,lowBound=0, cat=pulp.LpBinary))
indexes2 = np.arange(len(previos)).tolist()
previos_lot_size  = np.array(pulp.LpVariable.matrix(name="y", indexs=indexes2,lowBound=0, cat=pulp.LpInteger))
binary_previos_lot_size  = np.array(pulp.LpVariable.matrix(name="yz", indexs=indexes2,lowBound=0, cat=pulp.LpBinary))
isalojamiento=[]

# # if(jdemanda["algoritm"]=="Sin alojamiento"):
# #     lot_size = np.concatenate((previos_lot_size, lot_size), axis=None)
# #     binary_lot_size = np.concatenate((binary_previos_lot_size, binary_lot_size), axis=None)
    
lot_size = np.concatenate((previos_lot_size, lot_size), axis=None)
coefficients = np.repeat(1, len(lot_size))

sum = np.dot(coefficients, lot_size)


problem += sum

today = date.today()
fecha = jdemanda["fecha"][0].split("/")
fechaAlojamiento = date(int(fecha[2]),int(fecha[1]),int(fecha[0]))
diasprevios = int((fechaAlojamiento - today).days/7)
for i in range(0,len(binary_previos_lot_size)-diasprevios):
    if(jdemanda["algoritm"]!="Sin alojamiento"):
        problem += lot_size[i]==previos[i]
        isalojamiento.append(previos[i])
    else:
        problem += lot_size[i]==0
        isalojamiento.append(0)
for i in range(len(binary_previos_lot_size)-diasprevios,len(binary_previos_lot_size)):
    problem += previos[i]<= lot_size[i]
    problem += lot_size[i]<=(u + previos[i])
    isalojamiento.append(previos[i])
for i in range(len(binary_previos_lot_size),len(binary_previos_lot_size)+len(binary_lot_size)):
    problem += l*binary_lot_size[i-len(binary_previos_lot_size)]<= lot_size[i]
    problem +=lot_size[i]<=u*binary_lot_size[i-len(binary_previos_lot_size)]
    isalojamiento.append(0)


matriz = np.zeros((len(indexes),len(lot_size)))
posture = np.flip(jdemanda["posture"])
for i in range(0,len(indexes)):
    for j in range(i,i + len(jdemanda["posture"])):
        matriz[i,j]=posture[j-i]

demanda = np.array(jdemanda["demand"])



production = np.dot(matriz,lot_size)

demandas = []
for i in range(0,len(demanda)):
    demandas.append(demanda[i])
    #problem += production[i]>= demanda[i]
    if(i>0):
        #demprevia = production[i-1]-demanda[i-1]
        if(jdemanda["optimizer"]=="1"):
            #problem += (production[i]/demanda[i])<=((100 + jdemanda["diference"])/100)
            problem += (production[i]/demanda[i])>=((100 - jdemanda["diference"])/100)
        else:
            problem += production[i]>= demanda[i]
    else:
        if(jdemanda["optimizer"]=="1"):
            #problem += (production[i]/demanda[i])<=((100 + jdemanda["diference"])/100)
            problem += (production[i]/demanda[i])>=((100 - jdemanda["diference"])/100)
        else:
            problem += production[i]>= demanda[i]

          

problem.solve()

result = []
for i in range(0,len(lot_size)):
    result.append(lot_size[i].varValue)
produc = np.dot(matriz,result)
result2 = []
dif = []
difnro = []
for i in range(0,len(produc)):
    if(produc[i]!=0):
        dif.append(((demandas[i]/produc[i]))*100-100)
    else:
        dif.append(0)
    difnro.append(produc[i]-demandas[i])
    result2.append(produc[i])

formatDays = ['-']*(len(posture)-1)

if(problem.status==1):
    results = {"d":jdemanda["diference"],"dates": jdemanda["fecha"],"diferenceNro":formatDays + difnro,"diference":formatDays + dif,"algoritm":jdemanda["algoritm"],"production":formatDays + result2,"demand":formatDays + demandas,"lot_size": result,"isPrevios":isalojamiento}

else:
    results = {"dates":[],"diference":[],"algoritm":[],"production":[],"demand":[],"lot_size": []}
print(results)

    




    

