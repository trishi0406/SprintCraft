const Workspace = require('../models/Workspace');
const User = require('../models/User');

const getWorkspaces = async (req, res) => {
  try{
    const userId = req.user._id;
    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .populate('owner', 'name email avatar activeStatus')
      .populate('members.user', 'name email avatar activeStatus');

    return res.json(workspaces);
  } 
  catch (error) {
    console.error('Get Workspaces Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching workspaces' });
  }
}

const createWorkspace = async (req, res) => {
  try{
    const { name, description } = req.body;

    if(!name){
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Admin',
        },
      ],
    })

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar activeStatus')
      .populate('members.user', 'name email avatar activeStatus');

    return res.status(201).json(populatedWorkspace);
  } catch (error) {
    console.error('Create Workspace Error:', error.message);
    return res.status(500).json({ message: 'Server error creating workspace' });
  }
}

const addMember = async (req, res) => {
  try {
    const {id} = req.params;
    const {email, userId, role = 'Member'} = req.body;
    const workspace = await Workspace.findById(id);

    if(!workspace){
      return res.status(404).json({ message: 'Workspace not found' });
    }

    let targetUser;
    if(email){ 
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    } 
    else if (userId) {
      targetUser = await User.findById(userId);
    }

    if(!targetUser) {
      return res.status(404).json({ message: 'Target user to add was not found' });
    }

    const existingMember = workspace.members.find(
      (m) => m.user.toString() === targetUser._id.toString()
    )

    if(existingMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    workspace.members.push({
      user: targetUser._id,
      role: role === 'Admin' ? 'Admin' : 'Member',
    })

    await workspace.save();

    const updatedWorkspace = await Workspace.findById(id)
      .populate('owner', 'name email avatar activeStatus')
      .populate('members.user', 'name email avatar activeStatus');

    return res.json(updatedWorkspace);
  } 
  catch (error) {
    console.error('Add Workspace Member Error:', error.message);
    return res.status(500).json({ message: 'Server error adding member to workspace' });
  }
}

const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if(name !== undefined) {
      if(!String(name).trim()){
        return res.status(400).json({ message: 'Workspace name cannot be empty' });
      }
      workspace.name = String(name).trim();
    }
    if(description !== undefined) workspace.description = String(description);

    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate('owner', 'name email avatar activeStatus')
      .populate('members.user', 'name email avatar activeStatus');
    return res.json(populated);
  } 
  catch (error) {
    console.error('Update Workspace Error:', error.message);
    return res.status(500).json({ message: 'Server error updating workspace' });
  }
}

module.exports = {updateWorkspace,getWorkspaces, createWorkspace, addMember,
}
