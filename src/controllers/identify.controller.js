import { Op } from 'sequelize';
import Contact from '../models/contact.js'; 

export const identify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // get all contacts where either phone or email matches
    let searchConditions = [];
    if (email) {
      searchConditions.push({ email: email });
    }
    if (phoneNumber) {
      searchConditions.push({ phoneNumber: phoneNumber });
    }
    const contacts = await Contact.findAll({
      where: {
        [Op.or]: searchConditions, 
        deletedAt: null 
      },
      order: [['createdAt', 'ASC']], 
    });

    // if no contacts are retrieved (bec that email and phone doesnt exist), then will create new
    if (contacts.length === 0) {
      const newContact = await Contact.create({
        email: email || null, 
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary', // set it to primary
      });

      // specific return format of the newly created contact
      return res.json({
        contact: {
          primaryContatctId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // contacts with matching email and/or phone are found then:

    // determine the true primary
    const primaryContact = contacts[0];

    // demote other primaries to seconday and link them
    const otherPrimariesToDemote = contacts.filter(
      c => c.linkPrecedence === 'primary' && c.id !== primaryContact.id
    );

    for (const otherPrimary of otherPrimariesToDemote) {
      await otherPrimary.update({ linkPrecedence: 'secondary', linkedId: primaryContact.id });
    }

    // creating secondary contact only if new incoming contact provides actual new info
    const isEmailPresentInFoundSet = contacts.some(c => c.email === email);
    const isPhonePresentInFoundSet = contacts.some(c => c.phoneNumber === phoneNumber);

    let shouldCreateNewSecondary = false;

    if ((email && !isEmailPresentInFoundSet) || (phoneNumber && !isPhonePresentInFoundSet)) {
      shouldCreateNewSecondary = true;
    }

    if (shouldCreateNewSecondary) {
      await Contact.create({
        email: email || null,       
        phoneNumber: phoneNumber || null, 
        linkPrecedence: 'secondary',
        linkedId: primaryContact.id,
      });
    }

    // retrive all contacts linked to the primary (including primary itself)
    const allLinkedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id },
        ],
        deletedAt: null 
      },
      order: [['createdAt', 'ASC']] 
    });

    // collect all the emails, phones, and secondary contact ids
    const emails = [];
    const phoneNumbers = [];
    const secondaryContactIds = [];

    // adding primary contact's email and phone first 
    if (primaryContact.email) {
      emails.push(primaryContact.email);
    }
    if (primaryContact.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }

    // iterating through all linked contacts to collect unique emails, phone numbers, and secondary IDs
    for (const contact of allLinkedContacts) {
      if (contact.id === primaryContact.id) { // skip primary as its added it earlier
        continue;
      }

      // adding secondary emails / phone numbers if they haven't been added b4
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }

      // collect all the secondary IDs
      if (contact.linkPrecedence === 'secondary') {
        secondaryContactIds.push(contact.id);
      }
    }
    secondaryContactIds.sort((a, b) => a - b); // sort them

    return res.json({
      contact: {
        primaryContatctId: primaryContact.id,
        emails: emails, 
        phoneNumbers: phoneNumbers, 
        secondaryContactIds: secondaryContactIds,
      },
    });
  } 

  catch (error) {
    console.error('Identify error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
