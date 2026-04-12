"use server"
import { auth } from '@/auth'
import { db } from '@/db';


////// Environment
type createEnvironmentProps = {
  name: string,
  password: string
}
// create Environment
export async function createAnEnvironment({name, password}: createEnvironmentProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const if_envirnoment_existsed = await db.environment.findMany({ where: { name } });
  
      if (!name || if_envirnoment_existsed!.length >=1) {
        return ("Name already exists");
    }
    const environment = await db.environment.create({
      data: {
        name,
        password,
        ownerId: user.id
      }
    })
    console.log("environment created successfully");
    
    return environment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
// get Environment
export async function getEnvironment({name}: {name: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const envirnoment = await db.environment.findMany({
      where: {
        name: { contains: name.trim(), mode: 'insensitive' },
      }, include: {
        phones: true,
        items: true,
        collaborators: true,
        owner: true
      } });

    
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getEnvironmentById({id}: {id: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    if(!id) return console.log("Error--- Got no id!!")
    const envirnoment = await db.environment.findUnique({
      where: {
        id,
      },
      include: {
          phones: {
            orderBy: {
              createdAt: "desc",
            },
        },
        items: {
          orderBy: {
            createdAt: "desc",
          }
        },
        collaborators: {
          include:{user: true}
        },
        owner: true
      },
    });

    
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
// delete Environment
export async function deleteEnvironment({id}: {id: string}) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const envirnoment = await db.environment.findUnique({
      where: {
        id,
      },
      include: {
        phones: true,
        items: true,
        collaborators: true,
        accessEmails: true,
        owner: true
      }
    });

    console.log("environment created successfully");
    
    return envirnoment
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}


// create Item
export type createItemProps = {
  id?: string
  itemName :   string
  type: string
  text?: string
  userId?: string
  length: string
  fixedLength?: string,
  sellPrice:  string
  boughtPrice: string
  installmentPrice: string
  environmentId: string
}
export async function createItem({itemName, type, environmentId, sellPrice, boughtPrice, text, installmentPrice, length, fixedLength, userId}: createItemProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
     const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return new Error("Environment Not Found");
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator || isCollaborator?.role === 'VIEWER') {
      return new Error("You are not allowed to create");
    }
    const phone = await db.item.create({
      data: {
        itemName,
        text: text || "",
        length: length,
        fixedLength,
        
        sellPrice: sellPrice,
        boughtPrice: boughtPrice,
        installmentPrice: installmentPrice,
        type,
        environmentId,
        creatorId: userId || environment.ownerId,
      }
    })
    
    
    return phone
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getItems(environmentId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return "You need to sign in first";
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user || !user.id) {
      return "User Not Found";
    }

    // Check if the user is the owner of the environment
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
      select: { ownerId: true },
    });

    if (!environment) {
      return "Environment Not Found";
    }

    // Check if the user is a collaborator
    const isCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
      },
    });

    // If user is not the owner and not a collaborator, deny access
    if (environment.ownerId !== user.id && !isCollaborator) {
      return "Access Denied: You are not authorized to view this data.";
    }

    // Fetch the phones if the user is authorized
    const phones = await db.item.findMany({
      where: {
        environmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    ;
    return phones;
  } catch (err: unknown) {
    if (err instanceof Error) return "Error----" + err.message;
    else return "Unknown Error occurred";
  }
}


type UpdateItemInput = {
  environmentId: string;
  id: string;
  sellPrice?: string;
  boughtPrice?: string;
  installmentPrice?: string;
  length?: string;
  fixedLength?: string;
  text?: string;
};
export async function updateItem({
  environmentId,
  id,
  sellPrice,
  boughtPrice,
  installmentPrice,
  length,
  fixedLength,
}: UpdateItemInput) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    let data: { sellPrice?: string; boughtPrice?: string; installmentPrice?: string; length?: string, fixedLength?: string, text?: string } = {};
    if (sellPrice !== undefined && sellPrice !== "") data.sellPrice = String(sellPrice);
    if (boughtPrice !== undefined && boughtPrice !== "") data.boughtPrice = String(boughtPrice);
    if (installmentPrice !== undefined && installmentPrice !== "") data.installmentPrice = String(installmentPrice);
    if (length !== undefined && length !== "") data.length = String(length);
    if (fixedLength !== undefined && fixedLength !== "") data.fixedLength = String(fixedLength);
    
    const phones = await db.item.update({
      where: {
        id,
        environmentId,
      },
      data,
    });

    
    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function deleteItem({ environmentId, id}: { environmentId: string, id: string }) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }

    const phones = await db.item.delete({
      where: {
        id,
        environmentId,
      },
    });

    return phones
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}


/// add A Collaborator

export type accessEmailsProps = {
  email: string;
  role: "VIEWER" | "ADMIN";
  environmentId: string;
  
}
export type collaboratorProps = {
  environmentId: string,
  password: string
}
export async function addAccessEmails({email, role, environmentId}:accessEmailsProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !email) {
      return "Please, enter a valid email  \"example@email.com\"✅";
    }
    const isEmailExsits = await db.accessEmail.findUnique({ where: { email } })
    if (isEmailExsits) {
      return Error("Email is already exists, please add a different one")
    }
    const phone = await db.accessEmail.create({
      data: {
        email,
        role,
        environmentId,
      }
    })
    console.log("Email added successfully");
    
    return phone
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function JoinEnviromnent({environmentId, password}: collaboratorProps) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new Error("Environment not found");
    }

    const isAccepted = await db.accessEmail.findUnique({
      where: { email: session.user.email },
    });
    if (!isAccepted) {
      throw new Error("Sorry, you're not allowed to join");
    }
    if (environment.password !== password) {
      throw new Error("Incorrect password");
    }

    // Check if the user is already a collaborator
    const existingCollaborator = await db.collaborator.findFirst({
      where: {
        environmentId,
        userId: user.id,
        
      },
    });

    if (existingCollaborator) {
      throw new Error("User is already a collaborator in this environment");
    }

    // Add the new collaborator to the environment
    const newCollaborator = await db.collaborator.create({
      data: {
        userId: user.id,
        environmentId,
        role: isAccepted.role,
      },
    });

    
    return newCollaborator;
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}
export async function getARole(environmentId: string) {
  try {    
    const session = await auth();
  
    if (!session?.user?.email) {
        return ("You need to sing in first" )
    }
    const user = await db.user.findUnique({where: {email: session.user.email}});
      
      if (!user || !user.id) {
        return ("User Not Found");
    }
    const environment = await db.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new Error("Environment not found");
    }

    const collaborator = await db.collaborator.findFirst({
      where: {
        userId: user.id,
        environmentId,
      },
      include: {
        user: true,
      },
    });

    
    if (environment.ownerId === user.id) {
      return "ADMIN" 
    }else return collaborator?.role
  } catch (err: unknown) {
    if (err instanceof Error) return ("Error----" + err.message)
    else return "Unknown Error occurred"
  }
}

/////
